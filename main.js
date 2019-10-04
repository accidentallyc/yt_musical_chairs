

window.APP = new Vue({
  el: '#app',
  data: {
    currentScreen: 'menu',
    showCustomizeMenu:false,
    showCustomizeMessage:"customize game",
    model:{
      YTLink:'https://www.youtube.com/watch?v=I0JVRcJLea8',
      YTId:'',

      maxPause : 20,
      minPause : 5,
      minPlaytime : 1,
      maxPlaytime : 20,
      maxIterations : 30,
    },
    game: {
      isShowingMenu:false,
      isPaused: true,
      controller: null,
      player: null,
    }
  }, 
  methods: {
    toggleCustomizeMenu () {
      this.showCustomizeMenu = !this.showCustomizeMenu;
      if(this.showCustomizeMenu) {
        this.showCustomizeMessage = 'hide options';
      } else {
        this.showCustomizeMessage = 'customize game';
      }
    },
    toggleGameMenu() {
      this.game.isShowingMenu = !this.game.isShowingMenu;
    },
    backToMenu: function () {
      this.currentScreen = "menu";
      this.game.controller.destroy();
      this.game.controller = null;
    },
    startGame:  function () {
      this.currentScreen = "game";
      this.model.YTId = getVideoIdFromString(this.model.YTLink);
      
      this.game.controller = new MusicController;
      this.game.controller.maxPause = this.model.maxPause;
      this.game.controller.minPause = this.model.minPause;
      this.game.controller.minPlaytime = this.model.minPlaytime;
      this.game.controller.maxPlaytime = this.model.maxPlaytime;
      this.game.controller.maxIterations = this.model.maxIterations;

      this.game.controller.onPause(() => {
        this.game.player.pauseVideo();
        
      });
      this.game.controller.onUnpause(() => {
        this.game.player.playVideo();
        
      });
      
      
      setTimeout(() => {
        this.game.player = new YT.Player('player', {
          height: '390',
          width: '640',
          videoId: this.model.YTId,
          events: {
            onReady: () => {
              this.game.controller.start();
            },
            onStateChange : (event) => {
              switch (event.data) {
                case YT.PlayerState.PLAYING:
                  this.game.isPaused = false;
                  break;
                case YT.PlayerState.PAUSED:
                  this.game.isPaused = true;
                  break;
                default:
                  break;
              }
            }
          }
        });
      }, 100);

    },
  }
})

class MusicController {
  constructor() {
    this.maxPause = 20;
    this.minPause = 5;
    this.minPlaytime = 1;
    this.maxPlaytime = 20;
    this.maxIterations = 5;

    this.iterations = 0;


    this._maxPause = this.maxPause;
    this._minPause = this.minPause;
    this._minPlaytime = this.minPlaytime;
    this._maxPlaytime = this.maxPlaytime;
  }

  harder() {
    const perc = this.iterations/this.maxIterations;
    
    this._maxPause = this.maxPause - Math.round(this.maxPause * perc);
    this._minPause = this.minPause - Math.round(this.minPause * perc);
    this._minPlaytime = this.minPlaytime - Math.round(this.minPlaytime * perc);
    this._maxPlaytime = this.maxPlaytime - Math.round(this.maxPlaytime * perc);
  }

  getNextPause() {
    return  this._minPause + (Math.round(Math.random() * 100)%(this._maxPause-this._minPause));
  }
  
  getNextPlaytime() {
    return  this._minPlaytime + (Math.round(Math.random() * 100)%(this._maxPlaytime-this._minPlaytime));

  }

  onPause(pauseFn) {
    this.pauseFn = pauseFn;
    return this;
  }

  onUnpause(unpauseFn) {
    this.unpauseFn = unpauseFn;
    return this;
  }

  destroy() {
    // this essentially kills the infinite recursion
    this.iterations = Number.MAX_SAFE_INTEGER;
  }

  start() {
    this.iterations++;
    this.unpauseFn();

    if(this.iterations > this.maxIterations) {
      return;
    }

    setTimeout(() => {
      console.log("pausing")
      this.pauseFn();
      setTimeout(() => {
        this.harder();
        this.start();
      }, this.getNextPlaytime() * 1000);
    }, this.getNextPause() * 1000);
  }
}

/**
 * input
 *    https://www.youtube.com/watch?v=I0JVRcJLea8
 */
function getVideoIdFromString(url) {
  const r1 = url.match(/v=([0-9A-Za-z]+)/g);
  if(r1 && r1.length) {
    return r1[0].split("=").pop();
  }
}
