// roomListVue object to bind roomList from server and roomList in Vue
var roomListVue;

function loadRoomList(data){
        
    roomListVue = new Vue({
        el: "#roomlist-view",
        data: {
            hide: false,
            seenState: "roomlist",
            roomList: data,
            selectedRoomIndex: null, // null at he beginning
            joinRoomPassword: "",
            title: "",
            private: "",
            createRoomPassword: "",
            joinRoomPassword: ""
        },
        methods: {
            joinRoom: function(){
                // if room is private then take password as input from user
                // if not 
                // send join request
                
                // if selected room is private then ask for password
                if(this.roomList[this.selectedRoomIndex].private) 
                    this.seenState = "passwordView";
                
                else 
                    socket.emit("joinRoom",{roomId: this.roomList[this.selectedRoomIndex].id},function(res){
                        // server callback that indicates whether joining is okay or not
                        if(res.okay) {
                            loadGameView(res);
                        }
                    });
                
            },
            joinRoomPasswordViewOk: function(){
                socket.emit("joinRoom",{roomId: this.roomList[this.selectedRoomIndex].id, password: this.joinRoomPassword},function(res){
                    // server callback that indicates whether password is correct or not
                    if(res.okay){
                        loadGameView(res);
                    }
                    else alert("Wrong Password");
                });
            },
            selectRoom: function(index){
                this.selectedRoomIndex = index;
                console.log("room " + this.roomList[this.selectedRoomIndex].id + " selected");
            },
            createRoom: function(){
                socket.emit("createRoom",{title: this.title, private: this.private, password: this.createRoomPassword},function(res){
                    // server callback
                    res.game["admin"] = true; // save it as admin
                    loadGameView(res);
                });
                
                // reset values
                this.title = "";
                this.private = false;
                this.createRoomPassword = "";
                
                this.seenState = "roomlist"; // reset seenState
            },
            refreshRoomList: function(){
                socket.emit("refreshRoomList",function(data){
                    // server callback
                    console.log("roomlist was refreshed")
                    roomListVue.roomList= data;
                });
            }
        }
    });
        
}