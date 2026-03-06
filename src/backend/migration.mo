import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import List "mo:core/List";

module {
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

  type StudentRegistryEntry = {
    name : Text;
    grade : Nat8;
    xp : Nat;
    streakDays : Nat;
    badgeCount : Nat;
    lastActive : Time.Time;
  };

  type OldActor = {
    playerProfiles : Map.Map<Principal, PlayerProfile>;
    publicLeaderboard : Map.Map<Text, StudentRegistryEntry>;
    gameSessions : Map.Map<Principal, List.List<GameSession>>;
    unlockedLevels : Map.Map<Principal, Map.Map<Text, List.List<Nat>>>;
    visitCount : Nat;
  };

  type NewActor = {
    playerProfiles : Map.Map<Principal, PlayerProfile>;
    publicLeaderboard : Map.Map<Text, StudentRegistryEntry>;
    gameSessions : Map.Map<Principal, List.List<GameSession>>;
    unlockedLevels : Map.Map<Principal, Map.Map<Text, List.List<Nat>>>;
    activeUsers : Map.Map<Text, Time.Time>;
    visitCount : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      activeUsers = Map.empty<Text, Time.Time>();
    };
  };
};
