// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('labapp', ['ui.bootstrap','lab.filter','lab.team.controller','lab.meeting.controller','lab.mobile.event','lab.rtc-controller','angular-datepicker','ionic', 'lab.controllers', 'lab.services','btford.socket-io','ngCordova','lab.socket'])

.run(function(Friends,$cordovaTouchID,$cordovaFile,Device,$cordovaDevice,$ionicPlatform, socket, Auth,$localstorage,$state,$cordovaNetwork,$cordovaToast,$rootScope,$cordovaKeyboard,$cordovaStatusbar) {
  $ionicPlatform.isFullScreen = true;
  Device.width=$(window).width();
  Device.height=$(window).height();
  paper.install(window);

  $ionicPlatform.ready(function() {

    Device.platform=$cordovaDevice.getPlatform();
    Device.directory=cordova.file.dataDirectory.replace("NoCloud","files");
    $cordovaTouchID.checkSupport().then(function() {
      Device.supportTouchID=true;
    }, function (error) {
      Device.supportTouchID=false;
    });
    // $cordovaFile.removeFile('/friends.json').then(function(result) {
    //   alert('remove success');
    // }, function(err) {
    //   alert(err.code);
    // });


    

    $cordovaFile.checkFile('/friends.json').then(function(result) {
          $cordovaFile.readAsText('/friends.json').then(function(result){
            var file = JSON.parse(result);
            Friends.friends=file;
          },function(err){
            alert('read error '+err.code);
          })
      }, function(err) {
          alert('check error '+ err.code)
          $cordovaFile.createFile('friends.json',false).then(function(result){
            var data=JSON.stringify([
                {
                  name:'铸道小秘书',
                  index:0,
                  headsrc:'admin',
                  msg:[
                    {
                      type:'friend',
                      content:'欢迎来到铸道'
                    }
                  ]
                }
              ]);

            var options={
              append:false
            }
            $cordovaFile.writeFile('/friends.json',data,options).then(function(){
              alert('write success');
            },function(err){
              alert('write error '+err.code);
            })
          },function(err){
            alert('create error '+err.code);
          });
      });



    if (Device.platform=='iOS') {
      $cordovaKeyboard.disableScroll(true);
    }
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs);
    $cordovaKeyboard.hideAccessoryBar(true);
    if($cordovaNetwork.isOnline()) {
      var network = $cordovaNetwork.getNetwork();
      $cordovaToast.show('当前为'+network+'环境', 'short', 'bottom');
    }
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    $cordovaStatusbar.style(1);
  });

  Auth.authorize({
      type:'mobile',
      username:$localstorage.get('username'),
      token:$localstorage.get('token')
    },function(res){
      Auth.user=$localstorage.get('username');
      Auth.isLoggedIn=true;
      socket.emit('login',{username:Auth.user});
      $('.auth-mask').addClass('done');
    },function(err){
      $localstorage.set('username','');
      $localstorage.set('token','');
      $state.go('auth.login');
      // $state.go('tab.dash');
      $('.auth-mask').addClass('done');
  })

})

.run(function ($state, socket) {
  socket.on('messageReceived', function (name, message) {
    switch (message.type) {
      case 'call':
        if ($state.current.name === 'tab.meeting') { return; }
        
        $state.go('tab.meeting-call', { isCalling: false, contactName: name });
        break;
    }
  });
})

.config(function($cordovaInAppBrowserProvider,$ionicConfigProvider,$stateProvider, $urlRouterProvider) {
  $ionicConfigProvider.views.maxCache(20);
  var defaultOptions = {
    location: 'yes',
    clearcache: 'yes',
    toolbar: 'no'
  };
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('auth', {
      url: "/auth",
      abstract: true,
      template:'<ui-view/>'
    })

    .state('auth.login', {
      url: '/login',
      views: {
        '@': {
          templateUrl: 'templates/auth/login.html',
          controller: 'AuthCtrl'
        }
      }
    })

    .state('auth.signup', {
      url: '/signup',
      views: {
        '@': {
          templateUrl: 'templates/auth/signup.html',
          controller: 'AuthCtrl'
        }
      }
    })




    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tabs': {
          templateUrl: 'templates/communicate/tab-communicate.html',
          controller: 'DashCtrl'
        }
      },
      onEnter:function(){
        
      },
      onExit:function(){
        
      }
    })

    .state('tab.chat', {
      url: '/chat/:friendIndex',
      views: {
        'tabs': {
          templateUrl: 'templates/communicate/tab-chat.html',
          controller: 'ChatCtrl'
        }
      },
      onEnter:function(){
        $('.tabs').hide();
       
      },
      onExit:function(){
        $('.tabs').fadeIn();
        
      }
    })

    .state('tab.setting', {
      url: '/setting',
      views: {
        'tabs': {
          templateUrl: 'templates/communicate/tab-setting.html',
          controller: 'SettingCtrl'
        }
      },
      onEnter:function(){
        $('.tabs').hide();
      },
      onExit:function(){
        $('.tabs').fadeIn();

      }
    })
    .state('tab.new-meeting', {
      url: '/new-meeting',
      views: {
        'tabs': {
          templateUrl: 'templates/cooperation/new-meeting.html',
          controller: 'NewMeetingCtrl'
        }
      },
      onEnter:function(){
        $('.tabs').hide();
      },
      onExit:function(){
        $('.tabs').fadeIn();

      }
    })
    .state('tab.meeting', {
      url: '/meeting',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/meeting/meeting.html',
          controller: 'MeetingCtrl'
        }
      }
    })
    .state('tab.meetingrecordlist', {
      url: '/meeting-record-list',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/meeting/meeting-record-list.html',
          controller: 'MeetingRecordListCtrl'
        }
      }
    })
    .state('tab.meetingrecord', {
      url: '/meeting-record/{meetingNum}',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/meeting/meeting-record.html',
          controller: 'MeetingRecordCtrl'
        }
      }
    })
    .state('tab.meeting-call', {
      url: '/meeting-call/:contactName?isCalling',
      views: {
        'tabs': {
          templateUrl: 'templates/cooperation/meeting-call.html',
          controller: 'CallCtrl'
        }
      }
    })
    .state('tab.team', {
      url: '/team',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/team.html',
          controller: 'TeamCtrl'
        }
      },
      onEnter:function(){
        
      },
      onExit:function(){
        
      }
    })
    .state('tab.taskdetail', {
      url: '/task-detail/{list}/{taskNum}',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/task-detail.html',
          controller: 'TaskDetailCtrl'
        }
      },
      onEnter:function(){
        
      },
      onExit:function(){
        
      }
    })
    .state('tab.newtask', {
      url: '/new-task/{list}/{taskNum}',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/new-task.html',
          controller: 'TaskDetailCtrl'
        }
      },
      onEnter:function(){
        
      },
      onExit:function(){
        
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});

