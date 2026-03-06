import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

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
    visitCount : Nat;
  };

  type NewActor = {
    playerProfiles : Map.Map<Principal, PlayerProfile>;
    publicLeaderboard : Map.Map<Text, StudentRegistryEntry>;
    visitCount : Nat;
  };

  public func run({ playerProfiles; visitCount } : OldActor) : NewActor {
    let publicLeaderboard = Map.fromIter<Text, StudentRegistryEntry>(
      playerProfiles.entries().map(
        func(_principal, profile) {
          (
            profile.name,
            {
              name = profile.name;
              grade = profile.grade;
              xp = profile.xp;
              streakDays = profile.streakDays;
              badgeCount = profile.badges.size();
              lastActive = profile.lastPlayedEpoch;
            },
          );
        }
      )
    );

    {
      playerProfiles;
      publicLeaderboard;
      visitCount;
    };
  };
};
