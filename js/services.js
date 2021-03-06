labservice=angular.module('lab.services', []);

/**
 * A simple example service that returns some data.
 */
labservice.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { 
      headsrc:'admin',
      name: '铸道小秘书',
      index:0,
      lastmsg:'yep',
      msg:''
    },
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    },
    friends:friends
  }
});

labservice.factory('Meeting',function(){
  return {
    dataUrl:"http://115.159.35.129/",
    hasMeeting:false,
    currentSpeaker:'',
    currentSection:0,
    currentStepOfSection:0,
    currentFile:0,
    commentsOnStep:[],
    RTC:[],
    members:[],
    progress:[],
    sectionInfo:[

    ],
    allRecords:[],
    lastTwoRecords:[],
    duplicateMessages:[]
  }
})

labservice.factory('Board',function(){
  return {
    path:[],
    tool:undefined,
    pathWidth:5
  }
})

labservice.factory('Team',function(){
  return [
    {
      teamName:"乐道团队", 
      members:['TonyChol','cpycpy','windht','xxye','litao'],
      teamTaskList:[]
    }
  ]
})

labservice.factory('Task',function(){
  return {
    todo:[]
  }
})

labservice.factory('RTC',function(){
  return {
  }
})

labservice.factory('Email',function(){
  return {
    to:"caizhibin@buildmind.org",
    subject:"2015-01-27 会议记录",
    html:""
  }
})

labservice.factory('socket',function(socketFactory){
  return socketFactory({
    ioSocket: io.connect('http://lab.buildmind.cn')
  });
});

labservice.factory('Upload',function(){
  return {
    server:"http://lab.buildmind.cn/api/photo",
    src: {
      headicon:''
    },
    option: {
      img: {
        mimeType : "image/jpeg"
      }
    }
  }
});

labservice.factory('Device',function($cordovaTouchID){
  var hasTouchID=false;
  
  // $cordovaTouchID.checkSupport().then(function() {
  //  hasTouchID=true;
  // }, function (error) {
  // });
  return {
    isOnline:false,
    hasTouchID:hasTouchID,
    platform:'',
    supportTouchID:false,
    width:0,
    height:0
    }
});

labservice.factory('Func',function(){
  return {
    sideMenu:false
  }
});

labservice.factory('Chat',function(Auth,$cordovaTouchID){

  
  // $cordovaTouchID.checkSupport().then(function() {
  //  hasTouchID=true;
  // }, function (error) {
  // });
  return {
      currentIndex:0,
      input:'',
      hash:0,
      record:[
      {
        name:'铸道小秘书',
        msg:[]
      }
      ]
    }
});

labservice.factory('Auth', function($http,$localstorage){

    currentUser=$localstorage.get('username');

    function changeUser(user) {
        angular.extend(currentUser, user);
    }

    return {
        authorize: function(user, success, error) {
           $http.post('http://lab.buildmind.cn/auth', user).success(function(user){
                success(user);
            }).error(error);
        },
        isLoggedIn: false,
        register: function(user, success, error) {
            $http.post('http://lab.buildmind.cn/register', user).success(function(res) {
                success(res);
            }).error(error);
        },
        login: function(user, success, error) {
            $http.post('http://lab.buildmind.cn/login', user).success(function(user){
                success(user);
            }).error(error);
        },
        logout: function(user,success, error) {
            $http.post('http://lab.buildmind.cn/logout',user).success(function(){
                success();
            }).error(error);
        },
        user: currentUser,
        nextState:''
    };
});

labservice.factory('$localstorage',function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
});
