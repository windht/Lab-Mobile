angular.module('lab.socket', [])
.run(function (Board,$filter,Task,socket,Meeting,Chat,$ionicScrollDelegate,Auth,$timeout,Team) {

    var update=function() {
        for (i in Meeting.progress) {
            if (i<Meeting.currentSection) {
                Meeting.progress[i].value=Meeting.sectionInfo[i].sectionSteps.length;   
            }
            if (i==Meeting.currentSection) {
                Meeting.progress[i].value=Meeting.currentStepOfSection+1;
            }
            if (i>Meeting.currentSection) {
                Meeting.progress[i].value=0;
            }
            Meeting.progress[i].max=Meeting.sectionInfo[i].sectionSteps.length;
        }
    }

	socket.on('msg sent',function (data) {
        Chat.record[Chat.currentIndex].msg.push({
            hashkey:Chat.hash,
            content:data.msg,
            type:data.type
        });
        $ionicScrollDelegate.$getByHandle('chat-box').scrollBottom(true);
        Chat.hash+=1;
        Chat.input='';
        if($('#chat-scroll').children('.scroll').height()>=$('#chat-scroll').height()-150) {
            $('#chat-scroll').animate({top:"-150px"});
        }
    })

    socket.on('meeting step change',function (data) {
        Meeting.currentStepOfSection=data.currentStepOfSection;
        Meeting.currentSection=data.currentSection;
        update();
    })

    socket.on('meeting space',function(message){
      switch (message.type) {
        case 'members':      
          for (i in message.members) {
              Meeting.members.push({
                  name:message.members[i].name,
                  entered:message.members[i].entered,  //是否进入了房间
                  online:message.members[i].online,   //是否在线（还未制作）
                  connected:message.members[i].connect, //是否连接上语音
                  connecting:false,  //连接中状态
                  rtcSession:null   // rtcSession
              })
          }
        break;

        case 'member entering':
          for (i in Meeting.members) {
            if (Meeting.members[i].name==message.name) {
              Meeting.members[i].entered=true;
            }
          }
        break;

        case 'member leaving':
          for (i in Meeting.members) {
            if (Meeting.members[i].name==message.name) {
              Meeting.members[i].entered=false;
            }
          }
        break;

        case 'attend call':
          for (i in Meeting.members) {
            if (Meeting.members[i].rtcSession==null && Meeting.members[i].entered) {
                var contactName=Meeting.members[i].name;
                connect(false,contactName);
                socket.emit('rtc', contactName,{
                    type:'meeting call connection start',
                    from:Auth.user
                })
            }
          }
        break;
      }

        //处理完它们的状态后，直接开始连线，虽然不存在一个明确的谁call谁，但我们会让进入的人先开启session（但是不是作为initiator，这是这个开源程序的设置，无法解决。）
    })

    socket.on('rtc',receiveRTC);



    socket.on('new msg from friend',function(data){
        Chat.record[Chat.currentIndex].msg.push({
            hashkey:Chat.hash,
            content:data.msg,
            type:data.type
        });
        $ionicScrollDelegate.$getByHandle('chat-box').scrollBottom(true);
        Chat.hash+=1;
    })

    socket.on('meeting record',function(message){
      switch (message.type) {
        case 'all':
          Meeting.allRecords=message.data;
          var length=message.data.length;
          if (length>1) {
            Meeting.lastTwoRecords=[message.data[length-1],message.data[length-2]];
          }
          else {
            Meeting.lastTwoRecords=[message.data[0]];
          }
          
        break;
      }
    })

    socket.on('task information',function(message){
      taskInit(message.task);
    })

    socket.on('whiteboard change',function(message){
      paper.activate();
      switch (message.type) {
        case 'new path':
          var path  = new Path();
          Board.path.push(path);
          var length= Board.path.length;
          Board.path[length-1].strokeColor = 'black';
          Board.path[length-1].strokeWidth=10;
          var point=new Point(message.point[1],message.point[2])
          Board.path[length-1].add(point);
        break;

        case 'new seg':
          var length= Board.path.length;
          console.log(message.point);
          var point=new Point(message.point[1],message.point[2])
          Board.path[length-1].add(point);
          Board.path[length-1].smooth();
          view.draw();
        break;

        case 'path end':
          var length= Board.path.length;
          Board.path[length-1].simplify();
          console.log(Board.path[length-1]);
      }
    })

    function connect(isInitiator, contactName) {
          var config = { 
            isInitiator: isInitiator,
            turn: {
              host: 'turn:115.29.103.118:3478',
              username: 'windht',
              password: 'ht930531'
            },
            streams: {
              audio: true,
              video: false
            }
          };

          var session = new cordova.plugins.phonertc.Session(config);
          var contactIndex;
          for (i in Meeting.members) {
            if (Meeting.members[i].name==contactName) {
                contactIndex=i;
            }
          }
          
          session.on('sendMessage', function (data) { 
            socket.emit('rtc', contactName, {
              type:'rtc data' ,
              data: JSON.stringify(data),
              from: Auth.user
            });
          });

          session.on('answer', function () {
            Meeting.members[contactIndex].connected=true;
            console.log(Meeting.members[contactIndex].name+" connected");
          });

          session.on('disconnect', function () {
              socket.emit('rtc', contactName, { 
                type:'meeting call disconnection',
                from: Auth.user 
              });
              Meeting.members[contactIndex].connected=false;
          });
          session.call();
          //每一个成员都会有一个独立的session
          Meeting.members[contactIndex].rtcSession = session; 
          
    }

    function receiveRTC (name,message) {
        var contactIndex;
        var from=message.from;
        if (Meeting.members!=[]) {
          for (i in Meeting.members) {
              if (Meeting.members[i].name==from) {
                  contactIndex=i;
              }
          }
        }
        switch (message.type) {
            case 'rtc data':
                if (Meeting.members!=[]) {
                  Meeting.members[contactIndex].rtcSession.receiveMessage(JSON.parse(message.data));
                }  
              break;

            //如果对方退出或者断连，你会收到如下的socket，这时你只要终止他的session就可以了。
            case 'meeting call disconnection':
                $timeout(function(){
                  console.log(Meeting.members[contactIndex]);
                  if (Meeting.members!=[]) {
                    if (Meeting.members[contactIndex].rtcSession!=null) {
                      Meeting.members[contactIndex].rtcSession.close();
                      Meeting.members[contactIndex].rtcSession=null;
                    }
                  }
                },1500)
              break;

            case 'meeting call connection start':
                  connect(true,message.from);

              break;
        }   
    }

    function taskInit (task) {
      Team[0].teamTaskList=task;
      Task.todo=[];
      for (i in task) {
        for (j in task[i].listTasks) {
          var index=task[i].listTasks[j].taskChargeMembers.indexOf(Auth.user);
          if (index!=-1) {
            var status = checkDeadLine(task[i].listTasks[j].taskDeadLine);
            Task.todo.push({
              status:status,
              task:task[i].listTasks[j]
            });
          }
        }
      }
    }

    function checkDeadLine(date) {
      var today=new Date().getTime()/86400000;
      var dead=new Date(date).getTime()/86400000;
      var diff=new Number(dead-today).toFixed(0);
      if (diff>5) {
        return  'long'
      }
      else if (diff>=0) {
        return 'urgent'
      }
      else {
        return 'dead';
      }
    }
})
