var bapp = angular.module('lab.mobile.event', []);

bapp.run(function(socket,$timeout,$ionicActionSheet,Device,$cordovaFile,$cordovaDevice,$http,$httpBackend,$ionicPlatform, Auth,$localstorage,$state,$cordovaNetwork,$cordovaToast,$rootScope,$cordovaKeyboard,$cordovaStatusbar) {
	$ionicPlatform.ready(function() {
		$ionicPlatform.on('offline',function(){
			Device.isOnline=false;
		});
		$ionicPlatform.on('online',function(){
			Device.isOnline=true;
		});
		$ionicPlatform.on('pause',function(){
	  		
		});
		$ionicPlatform.on('resume',function(){
	  		$timeout(function(){
	  			alert('回来啦！');
	  			if (Auth.isLoggedIn) {
	  				socket.emit('login',{username:Auth.user});
	  			}	
	  			else {
	  				Auth.authorize({
				      type:'mobile',
				      username:$localstorage.get('username'),
				      token:$localstorage.get('token')
				    },function(res){
				      Auth.user=$localstorage.get('username');
				      Auth.isLoggedIn=true;
				      socket.emit('login',{username:Auth.user});
				      $('.auth-mask').addClass('done');
				      $state.go('tab.dash');
				    },function(err){
				      $localstorage.set('username','');
				      $localstorage.set('token','');
				      $state.go('auth.login');
				      // $state.go('tab.dash');
				      $('.auth-mask').addClass('done');
				  	})
	  			}
	  		},0)
		});

	})
})
