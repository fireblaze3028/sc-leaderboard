import Player from "./Player.js";
import Score from "./Score.js";
import { calcAcc, calcPosition, getDisplayMods } from "../utils.js";

const app = {
  name: 'App',
  components: { Player, Score },
  // https://v3.vuejs.org/guide/composition-api-introduction.html#basics-of-composition-api
  setup(props, context) {
    const data = Vue.reactive({
      tokens: {},
      playersMap: new Map(),
      playersMapRight: new Map(),
      blueScore: 0,
      redScore: 0,
      show: false,
      rws: {},
    });

    //map global _GetToken helper method
    const getToken = (tokenName, decimalPlaces) => _GetToken(data.rws, data.tokens, tokenName, decimalPlaces);

    let isPlayingOrWatching = Vue.computed(() =>
      _IsInStatus(data.rws, data.tokens, [window.overlay.osuStatus.Playing, window.overlay.osuStatus.ResultsScreen, window.overlay.osuStatus.Watching])
    );

    // current and previous status, used to identify whether in multiplayer or singleplayer
    let currentStatus;
    let previousStatus;

    // player currently playing
    let mainPlayer;

    let show;

    data.rws = watchTokens(['leaderBoardMainPlayer', 'leaderBoardPlayers', 'banchoId', 'banchoUsername', 'rawStatus', 'time', 'firstHitObjectTime', 'isBreakTime'], (values) => {
      show = true;

      for (let key in values) {
        try {
          values[key] = JSON.parse(values[key]);
        } catch (error) {/* parse what can be parsed and leave strings untouched */}
      }

      if (values.rawStatus !== undefined) {
        previousStatus = currentStatus;
        currentStatus = values.rawStatus;

        // if player isnt playing, don't show leaderboard
        if (currentStatus !== 2) {
          show = false;
        }
      }

      if (values.time !== undefined) {
        if (values.time * 1000 < data.tokens.firstHitObjectTime) {
          show = false;
        }
      }

      const isBreakTime = data.tokens.isBreakTime;
      if (isBreakTime) { 
        show = false;
      }

      // positions for each person on their respective team
      const teamPositions = new Map();

      // playing on multiplayer if previous status is 12 (multiplayer room)
      const playingMultiplayer = previousStatus === 12;

      const temp = values.leaderBoardMainPlayer;
      // if there is a main player and the replay changes (for example when retrying a map), create a new map to be filled with new players and show the leaderboard
      if (temp && temp.Mods) {
        if (!mainPlayer || ((mainPlayer.Hit300 + mainPlayer.Hit100 + mainPlayer.Hit50 + mainPlayer.HitMiss) > (temp.Hit300 + temp.Hit100 + temp.Hit50 + temp.HitMiss))) {
          data.playersMap = new Map();
          data.playersMapRight = new Map();
        }
        mainPlayer = temp;
      }

      if (mainPlayer && mainPlayer.IsLeaderboardVisible) {
        show = false;
      }

      const leaderboard = values.leaderBoardPlayers;
      // if theres a leaderboard update, update all players on it 
      if (leaderboard instanceof Array) {

        // scores of each team
        data.blueScore = 0;
        data.redScore = 0;

        console.log(leaderboard);
        for (const position of leaderboard) {
          // calculate different properties for each position
          position.Accuracy = calcAcc(position.Hit300, position.Hit100, position.Hit50, position.HitMiss);
          position.DisplayMods = getDisplayMods(position.Mods.Value);
          position.DisplayCombo = playingMultiplayer ? position.Combo : position.MaxCombo;
          
          // bancho id to use to get pfp of user
          position.banchoId = data.tokens.banchoId;

          // whether this position is the main player or not
          if (mainPlayer) {
            position.Main = playingMultiplayer ? (mainPlayer.Username === position.Username) : (mainPlayer.Mods.ModsXor1 === position.Mods.ModsXor1);
          }

          // count positions for each team
          if (!teamPositions.has(position.Team)) {
            teamPositions.set(position.Team, 1);
          }
          position.TeamPosition = teamPositions.get(position.Team);
          teamPositions.set(position.Team, teamPositions.get(position.Team) + 1);

          // set the mainPlayer team position if this position is the main player
          if (position.Main) {
            mainPlayer.TeamPosition= position.TeamPosition;
          }

          // blue team (or gamemode with no teams)
          if (position.Team <= 1) {
              data.playersMap.set(playingMultiplayer ? position.Username : position.Mods.ModsXor1, position);
              data.blueScore += position.Score;
          }
          // red team
          else {
            data.playersMapRight.set(playingMultiplayer ? position.Username : position.Mods.ModsXor1, position);
            data.redScore += position.Score;
          }
          
        }

        // calculate offset after team positions have been calculated
        for (const position of leaderboard) {
          position.Offset = calcPosition(position, mainPlayer);
        }
      }

      data.show = show;
      Object.assign(data.tokens, values);
    });
  
    //start websocket connection to SC

    //return all data & computed vars & methods that we want to use elsewhere in this component
    return {
      getToken,
      isPlayingOrWatching,
      data,
    };
  },
};

export default app;
