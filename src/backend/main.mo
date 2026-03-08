import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";




actor {
  type PlayerProfile = {
    name : Text;
    grade : Nat8;
    xp : Nat;
    streakDays : Nat;
    badges : [Text];
    weakTopics : [Text];
    lastPlayedEpoch : Time.Time;
  };

  type GameSession = {
    gameId : Text;
    level : Nat;
    score : Nat;
    correctAnswers : Nat;
    incorrectAnswers : Nat;
    topicId : Text;
    timestamp : Time.Time;
  };

  type LeaderboardEntry = {
    name : Text;
    grade : Nat8;
    xp : Nat;
  };

  type StudentRegistryEntry = {
    name : Text;
    grade : Nat8;
    xp : Nat;
    streakDays : Nat;
    badgeCount : Nat;
    lastActive : Time.Time;
  };

  type PublicStats = {
    totalVisits : Nat;
    leaderboard : [LeaderboardEntry];
    activeUsers : Nat;
  };

  type ClassGroup = {
    id : Text;
    name : Text;
    joinCode : Text;
    createdAt : Time.Time;
    memberNames : [Text];
  };

  module LeaderboardEntry {
    public func compare(a : LeaderboardEntry, b : LeaderboardEntry) : Order.Order {
      Nat.compare(b.xp, a.xp);
    };
  };

  let playerProfiles = Map.empty<Principal, PlayerProfile>();
  let publicLeaderboard = Map.empty<Text, StudentRegistryEntry>();
  let gameSessions = Map.empty<Principal, List.List<GameSession>>();
  let unlockedLevels = Map.empty<Principal, Map.Map<Text, List.List<Nat>>>();
  let activeUsers = Map.empty<Text, Time.Time>();
  let classGroups = Map.empty<Text, ClassGroup>();

  var visitCount = 0;

  // Player Profile Management (device-based storage)
  public shared ({ caller }) func createOrUpdateProfile(name : Text, grade : Nat8) : async () {
    let newProfile : PlayerProfile = {
      name;
      grade;
      xp = 0;
      streakDays = 0;
      badges = [];
      weakTopics = [];
      lastPlayedEpoch = Time.now();
    };
    playerProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getProfile() : async ?PlayerProfile {
    playerProfiles.get(caller);
  };

  public shared ({ caller }) func resetProgress() : async () {
    switch (playerProfiles.get(caller)) {
      case (null) {};
      case (?existingProfile) {
        let resetProfile : PlayerProfile = {
          existingProfile with
          xp = 0;
          streakDays = 0;
          badges = [];
          weakTopics = [];
        };
        playerProfiles.add(caller, resetProfile);
      };
    };
  };

  // Game Session Recording
  public shared ({ caller }) func recordGameSession(
    gameId : Text,
    level : Nat,
    score : Nat,
    correctAnswers : Nat,
    incorrectAnswers : Nat,
    topicId : Text,
  ) : async () {
    switch (playerProfiles.get(caller)) {
      case (null) {};
      case (?existingProfile) {
        let newSession : GameSession = {
          gameId;
          level;
          score;
          correctAnswers;
          incorrectAnswers;
          topicId;
          timestamp = Time.now();
        };

        // Update Game Sessions
        let currentSessions = switch (gameSessions.get(caller)) {
          case (null) { List.empty<GameSession>() };
          case (?sessions) { sessions };
        };
        currentSessions.add(newSession);
        gameSessions.add(caller, currentSessions);

        // XP and Badges
        let xpGained = if (score >= 10) { score / 10 } else { 1 };
        let newTotalXp = existingProfile.xp + xpGained;
        let newBadges = List.fromArray(existingProfile.badges);
        if (existingProfile.badges.size() == 0) {
          newBadges.add("first_win");
        };
        if (existingProfile.xp < 100 and newTotalXp >= 100) {
          newBadges.add("xp_100");
        };
        if (existingProfile.xp < 500 and newTotalXp >= 500) {
          newBadges.add("xp_500");
        };
        let newWeakTopics = if (incorrectAnswers > correctAnswers) {
          if (not existingProfile.weakTopics.values().contains(topicId)) {
            [topicId];
          } else {
            [];
          };
        } else {
          existingProfile.weakTopics;
        };

        // Update Profile
        let updatedProfile : PlayerProfile = {
          existingProfile with
          xp = newTotalXp;
          badges = newBadges.toArray();
          weakTopics = newWeakTopics;
        };
        playerProfiles.add(caller, updatedProfile);

        // Unlock Next Level if Score >= 60
        if (score >= 60) {
          let currentLevels = switch (unlockedLevels.get(caller)) {
            case (null) { Map.empty<Text, List.List<Nat>>() };
            case (?levels) { levels };
          };

          let gameLevels = switch (currentLevels.get(gameId)) {
            case (null) { List.empty<Nat>() };
            case (?levels) { levels };
          };

          if (not gameLevels.contains(level)) {
            gameLevels.add(level);
            currentLevels.add(gameId, gameLevels);
            unlockedLevels.add(caller, currentLevels);
          };
        };

        // Update Streak
        let currentDay = Time.now() / (24 * 60 * 60 * 1000000000);
        let lastDay = existingProfile.lastPlayedEpoch / (24 * 60 * 60 * 1000000000);
        let newStreak = if (currentDay == lastDay + 1) {
          existingProfile.streakDays + 1;
        } else { 1 };

        let finalProfile : PlayerProfile = {
          updatedProfile with
          streakDays = newStreak;
          lastPlayedEpoch = Time.now();
        };
        playerProfiles.add(caller, finalProfile);
      };
    };
  };

  // Leaderboard Entry Submission (anonymous players)
  public shared ({ caller }) func submitLeaderboardEntry(
    name : Text,
    grade : Nat8,
    xp : Nat,
    streakDays : Nat,
    badgeCount : Nat,
  ) : async () {
    let newEntry : StudentRegistryEntry = {
      name;
      grade;
      xp;
      streakDays;
      badgeCount;
      lastActive = Time.now();
    };

    switch (publicLeaderboard.get(name)) {
      case (null) {
        publicLeaderboard.add(name, newEntry);
      };
      case (?existingEntry) {
        if (xp > existingEntry.xp) {
          publicLeaderboard.add(name, newEntry);
        };
      };
    };
  };

  // Get Top Leaderboard Entries (public query)
  public query ({ caller }) func getTopLeaderboardEntries() : async [LeaderboardEntry] {
    let entries = publicLeaderboard.values().toArray().map(
      func(entry) {
        {
          name = entry.name;
          grade = entry.grade;
          xp = entry.xp;
        };
      }
    );
    let sorted = entries.sort();
    if (sorted.size() <= 20) {
      sorted;
    } else {
      sorted.sliceToArray(0, 20);
    };
  };

  // Get All Student Profiles (from public leaderboard)
  public query ({ caller }) func getAllStudentProfiles() : async [StudentRegistryEntry] {
    let entries = publicLeaderboard.values().toArray();
    entries.sort();
  };

  // Helper function to get active users count (within 60 seconds)
  func getActiveUserCount() : Nat {
    let currentTime = Time.now();
    let cutoffTime = currentTime - 60_000_000_000; // 60 seconds in nanoseconds
    var count = 0;
    let values = activeUsers.values();
    for (timestamp in values) {
      if (timestamp >= cutoffTime) {
        count += 1;
      };
    };
    count;
  };

  // Public Stats with activeUser count
  public query ({ caller }) func getPublicStats() : async PublicStats {
    let leaderboard = publicLeaderboard.values().toArray().map(
      func(entry) {
        {
          name = entry.name;
          grade = entry.grade;
          xp = entry.xp;
        };
      }
    );
    let activeUserCount = getActiveUserCount();
    {
      totalVisits = visitCount;
      leaderboard;
      activeUsers = activeUserCount;
    };
  };

  // Level Unlock Tracking
  public query ({ caller }) func getUnlockedLevels(gameId : Text) : async [Nat] {
    switch (unlockedLevels.get(caller)) {
      case (null) { [1] };
      case (?gameLevels) {
        switch (gameLevels.get(gameId)) {
          case (null) { [1] };
          case (?levels) { levels.toArray() };
        };
      };
    };
  };

  // Track page visits
  public shared ({ caller }) func trackVisit() : async () {
    // Increment visit count each time a page is visited
    visitCount += 1;
  };

  // Return total visits (public query)
  public query ({ caller }) func getTotalVisits() : async Nat {
    visitCount;
  };

  // Track active user heartbeat
  public shared ({ caller }) func heartbeat(name : Text) : async () {
    let currentTime = Time.now();
    activeUsers.add(name, currentTime);
  };

  // Return number of active users within 60 seconds
  public query ({ caller }) func getActiveUsers() : async Nat {
    // Count only users with heartbeat in the last 60 seconds
    getActiveUserCount();
  };

  // ------------- New Class Group System Methods -------------

  // Create a new class group
  public shared ({ caller }) func createClass(name : Text, joinCode : Text) : async Text {
    let classId = joinCode; // Using joinCode as classId for simplicity
    let newClass : ClassGroup = {
      id = classId;
      name;
      joinCode;
      createdAt = Time.now();
      memberNames = [];
    };
    classGroups.add(classId, newClass);
    classId;
  };

  // Student joins a class
  public shared ({ caller }) func joinClass(joinCode : Text, studentName : Text) : async Bool {
    switch (classGroups.get(joinCode)) {
      case (null) { false };
      case (?existingClass) {
        if (not existingClass.memberNames.find(func(member) { member == studentName }).isNull()) {
          return false; // Student already in class
        };
        let updatedMembers = [studentName].concat(existingClass.memberNames);
        let updatedClass : ClassGroup = {
          existingClass with
          memberNames = updatedMembers;
        };
        classGroups.add(joinCode, updatedClass);
        true;
      };
    };
  };

  // Get all class groups
  public query ({ caller }) func getAllClasses() : async [ClassGroup] {
    classGroups.values().toArray();
  };

  // Get class by join code
  public query ({ caller }) func getClassByCode(joinCode : Text) : async ?ClassGroup {
    classGroups.get(joinCode);
  };

  // Remove student from class (admin use)
  public shared ({ caller }) func removeStudentFromClass(joinCode : Text, studentName : Text) : async () {
    switch (classGroups.get(joinCode)) {
      case (null) {};
      case (?existingClass) {
        let filteredMembers = existingClass.memberNames.filter(
          func(member) { member != studentName }
        );
        let updatedClass : ClassGroup = {
          existingClass with
          memberNames = filteredMembers;
        };
        classGroups.add(joinCode, updatedClass);
      };
    };
  };

  // ------- New Weekly Hall of Fame Method -----------

  public query ({ caller }) func getWeeklyTopPlayers() : async [StudentRegistryEntry] {
    let currentTime = Time.now();
    let oneWeekNanos : Time.Time = 7 * 24 * 60 * 60 * 1000000000;

    let filteredEntries = publicLeaderboard.values().toArray().filter(
      func(entry) { currentTime - entry.lastActive <= oneWeekNanos }
    );

    let sortedEntries = filteredEntries.sort();
    if (sortedEntries.size() <= 3) {
      sortedEntries;
    } else {
      sortedEntries.sliceToArray(0, 3);
    };
  };
};
