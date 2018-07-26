$(function(){
        let usr = $("#username").val();
        let clr = "rgb("+$("#msgBackground").val()+");";
        console.log(clr);
        let socket = io.connect();

          //emit events
          let uNum = 1;
          socket.on('connect',function(){
            console.log('user connected to the chat room');
            socket.emit('user join', usr,uNum);
          });

          //socket.on('disconnect',function(){
          //  socket.emit('user left', usr);
          //});

          $('form').submit(function(){
            let date = new Date();
            let minNum = date.getMinutes();
            let mins;
            if(10>minNum){
               mins = "0"+minNum;
            }else{
               mins = minNum;
            }
            let time = date.getHours()+":"+mins;
            socket.emit('chat msg', $('#msg').val(),usr,clr,time);
            $('#msg').val('');
            return false;
          });
	  /*
          let typingState=false;

          $("#msg").keyup(function(){
            if(!typingState) {
              socket.emit('typing', usr);
              typingState = true;
            }
            let typingTimer = setTimeout(() => {
                socket.emit('stop typing', usr);
                typingState=false;
              }, 2500);
            $("#msg").keydown(function() {
              clearTimeout(typingTimer);
            });
          });
	  */

          //catch events
          socket.on('chat msg', function(msg,username,color,time){
            let msgBody = '<p style="background-color:'+color+' font-weight:700;">';
            let msgContent = username+" ( "+time+" ) "+": "+msg;
            $("#messages").append($(msgBody).text(msgContent));

            var msgBox = document.getElementById("messages");
            msgBox.scrollTop = msgBox.scrollHeight;
          });

          socket.on('user join', function(user, data){
            $('#numberConnected').html("Users online: "+data);
            let pTag = '<p class="enterParagraph">';
            let spanIcon = '<span class="glyphicon glyphicon-user">';
            let message = "CONSOLE: "+user+" has just joined the room. Say hello !"
            $("#messages").append($(pTag+spanIcon).text(message));
            var msgBox = document.getElementById("messages");
            msgBox.scrollTop = msgBox.scrollHeight;
          });

          socket.on('user left', function(user, data){
            $('#numberConnected').html("Users online: "+data);
            let pTag = '<p class="closeParagraph">';
            let message = "CONSOLE: someone has just left the room."
            $("#messages").append($(pTag).text(message));
            var msgBox = document.getElementById("messages");
            msgBox.scrollTop = msgBox.scrollHeight;
          });
	  /*
          socket.on('user typing', function(user) {
            if(usr !== user) {
              let ptagCreate = "<p class=id"+user+">";
              console.log("dupa");
              $("#typing").append(ptagCreate+user+" is typing "+"</p>");
              socket.on('user stop typing', function(user){
                let ptagRemove = ".id"+user;
                $(ptagRemove).remove();
              });
            }
          });
 	  */
});
