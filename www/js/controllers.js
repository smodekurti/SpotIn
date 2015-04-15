angular.module('songhop.controllers', ['ionic', 'songhop.services'])



/*
 Controller for the Splash page
*/
.controller('SplashCtrl', function($scope, $state, User) {
 // attempt to signup/login via User.auth
  $scope.submitForm = function(username, signingUp) {
    User.auth(username, signingUp).then(function(){
      // session is now set, so lets redirect to discover page
      $state.go('tab.discover');

    }, function() {
      // error handling here
      alert('Hmm... try another username.');

    });
  }
})

/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope,$ionicLoading ,$timeout, User, Recommendations ) {
     // helper functions for loading
    
    
      var showLoading = function() {
        $ionicLoading.show({
          template: '<i class="ion-loading-c"></i>',
          noBackdrop: true
        });
      }
      
      $scope.playOrPause = function(){
          if($scope.playing){
              Recommendations.haltAudio();
            $scope.playing = false;
          }
          else{
              Recommendations.continueAudio();
              $scope.playing=true;
          }
      }

      var hideLoading = function() {
        $ionicLoading.hide();
      }

      // set loading to true first time while we retrieve songs from server.
      showLoading();
    
    Recommendations.init()
    .then(function(){
     
      $scope.currentSong = Recommendations.queue[0];
      Recommendations.playCurrentSong();
      $scope.playing = true;
      hideLoading();
      $scope.currentSong.loaded = true;
      
      Recommendations.didSongEnded()
      .then(function(){
          console.log('Song ended !!!');
         $scope.playing = false;  
      });
    });
      
    
      // used for retrieving the next album image.
  // if there isn't an album image available next, return empty string.
  $scope.nextAlbumImg = function() {
    if (Recommendations.queue.length > 1) {
      return Recommendations.queue[1].image_large;
    }

    return '';
  }
    
   $scope.sendFeedback = function (bool) {

        // set variable for the correct animation sequence
        $scope.currentSong.rated = bool;
        $scope.currentSong.hide = true;

        if($scope.currentSong.rated == true){
            User.addSongToFavorites($scope.currentSong);
        }

         Recommendations.nextSong();

        $timeout(function() {
           // $timeout to allow animation to complete
          $scope.currentSong = Recommendations.queue[0];
          $scope.currentSong.loaded = false;
        }, 250);

        Recommendations.playCurrentSong()
        .then(function() {
          console.log("Now playing");
          $scope.currentSong.loaded = true;
          $scope.playing = true;
            
          Recommendations.didSongEnded()
              .then(function(){
                  console.log('Song ended !!!');
                 $scope.playing = false;  
              });
        });
  }
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope,User) {
  // get the list of our favorites from the user service
  $scope.favorites = User.favorites;
  $scope.username = User.username;
  
    $scope.removeSong = function(song, index) {
    User.removeSongFromFavorites(song, index);
  }
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, $window,User, Recommendations) {
  $scope.favCount = User.favoriteCount;
  
  $scope.enteringFavorites = function() {
    User.newFavorites = 0;
    Recommendations.haltAudio();
  }
 $scope.leavingFavorites = function() {
    Recommendations.init();
  }
 
  $scope.logout = function() {
    User.destroySession();

    // instead of using $state.go, we're going to redirect.
    // reason: we need to ensure views aren't cached.
    $window.location.href = 'index.html';
  }
});