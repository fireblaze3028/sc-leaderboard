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

    const animation = {
      blue: new CountUp('blue', 0, 0, 0, 0.5, { decimalPlaces: 2, useEasing: true, useGrouping: false, separator: ",", decimal: ".", padDecimals: 8}),
      red: new CountUp('red', 0, 0, 0, 0.5, { decimalPlaces: 2, useEasing: true, useGrouping: false, separator: ",", decimal: ".", padDecimals: 8})
    }

    //map global _GetToken helper method
    const getToken = (tokenName, decimalPlaces) => _GetToken(data.rws, data.tokens, tokenName, decimalPlaces);

    let isPlayingOrWatching = Vue.computed(() =>
      _IsInStatus(data.rws, data.tokens, [window.overlay.osuStatus.Playing, window.overlay.osuStatus.ResultsScreen, window.overlay.osuStatus.Watching])
    );

    let banchoId = Vue.computed(() => {
      return data.tokens.banchoId;
    })

    let previousXor;
    let currentStatus;
    let previousStatus;
    let mainPlayer;

    data.rws = watchTokens(['leaderBoardMainPlayer', 'leaderBoardPlayers', 'banchoId', 'banchoUsername', 'rawStatus'], (values) => {

      if (values["rawStatus"] !== undefined) {
        previousStatus = currentStatus;
        currentStatus = values["rawStatus"];

        if (currentStatus !== 2) {
          data.show = false;
        }
      }

      const teamPositions = new Map();

      const playingSinglePlayer = previousStatus === 7 || previousStatus === 5;

      for (let key in values) {
        try {
          values[key] = JSON.parse(values[key]);
        } catch (error) {/* parse what can be parsed and leave strings untouched */}
      }

      const temp = values.leaderBoardMainPlayer;
      // if there is a main player and the replay changes (for example when retrying a map), delete the old score from playersMap
      if (temp && temp.Mods) {
        if (!mainPlayer || ((mainPlayer.Hit300 + mainPlayer.Hit100 + mainPlayer.Hit50 + mainPlayer.HitMiss) > (temp.Hit300 + temp.Hit100 + temp.Hit50 + temp.HitMiss))) {
          data.playersMap = new Map();
          data.playersMapRight = new Map();
          data.show = true;
        }
        mainPlayer = temp;
        if (previousXor != mainPlayer.Mods.ModsXor1) {
          //data.playersMap = new Map();
          //data.playersMapRight = new Map();
          previousXor = mainPlayer.Mods.ModsXor1;
        }
        
      }

      const leaderboard = values.leaderBoardPlayers;
      // if theres a leaderboard update, update all players on it 
      if (leaderboard instanceof Array) {
        data.blueScore = 0;
        data.redScore = 0;

        for (const position of leaderboard) {
          position.Accuracy = calcAcc(position.Hit300, position.Hit100, position.Hit50, position.HitMiss);
          position.DisplayMods = getDisplayMods(position.Mods.Value);
          position.DisplayCombo = playingSinglePlayer ? position.MaxCombo : position.Combo;
          position.banchoId = data.tokens.banchoId;
          position.Main = mainPlayer ? playingSinglePlayer ? (mainPlayer.Mods.ModsXor1 === position.Mods.ModsXor1) : (mainPlayer.Username === position.Username) : false;
          if (!teamPositions.has(position.Team)) {
            teamPositions.set(position.Team, 1);
          }

          position.TeamPosition = teamPositions.get(position.Team);
          teamPositions.set(position.Team, teamPositions.get(position.Team) + 1);

          if (mainPlayer.Mods.ModsXor1 === position.Mods.ModsXor1) {
            mainPlayer.TeamPosition= position.TeamPosition;
          }

          if (position.Team <= 1) {
            data.playersMap.set(playingSinglePlayer ? position.Mods.ModsXor1 : position.Username, position);
            data.blueScore += position.Score;
          }
          else {
            data.playersMapRight.set(playingSinglePlayer ? position.Mods.ModsXor1 : position.Username, position);
            data.redScore += position.Score;
          }
          
        }

        for (const position of leaderboard) {
          position.Offset = calcPosition(position, mainPlayer);
        }
      }

      Object.assign(data.tokens, values);
    });
  
    //start websocket connection to SC

    //return all data & computed vars & methods that we want to use elsewhere in this component
    return {
      getToken,
      banchoId,
      isPlayingOrWatching,
      data,
    };
  },
};

export default app;
