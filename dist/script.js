//↓soundpack定義一包的資料，給audio用，包含number:音符號碼、url:音檔來源
var soundpack=[];
//↓要載入的音符號碼陣列
var soundpack_index=[1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,8,8.5,9,9.5,10,11,11.5,12,12.5,13,13.5,14,15];
//↓推一組的資料進去，這邊會提供audio作渲染
for(var i=0;i<soundpack_index.length;i++){
  soundpack.push({
    number: soundpack_index[i],
    url: "https://awiclass.monoame.com/pianosound/set/"+soundpack_index[i]+".wav"
  });
}

var vm = new Vue({
  el: "#app",
  data: {
    sounddata: soundpack,
    notes: [{"num":1,"time":150},{"num":1,"time":265},{"num":5,"time":380},{"num":5,"time":501},{"num":6,"time":625},{"num":6,"time":748},{"num":5,"time":871},{"num":4,"time":1126},{"num":4,"time":1247},{"num":3,"time":1365},{"num":3,"time":1477},{"num":2,"time":1597},{"num":2,"time":1714},{"num":1,"time":1837}],
    now_note_id: 0,
    next_note_id: 0,
    playing_time: 0,
    record_time: 0,
    now_press_key: -1,
    player: null,
    recorder: null,
    display_keys:[
      {num: 1,key: 90  ,type:'white'},
      {num: 1.5,key: 83  ,type:'black'},
      {num: 2,key: 88  ,type:'white'},
      {num: 2.5,key: 68  ,type:'black'},
      {num: 3,key: 67  ,type:'white'},
      {num: 4,key: 86  ,type:'white'},
      {num: 4.5,key: 71  ,type:'black'},
      {num: 5,key: 66  ,type:'white'},
      {num: 5.5,key: 72  ,type:'black'},
      {num: 6,key: 78  ,type:'white'},
      {num: 6.5,key: 74  ,type:'black'},
      {num: 7,key: 77  ,type:'white'},
      {num: 8,key: 81  ,type:'white'},
      {num: 8.5,key: 50  ,type:'black'},
      {num: 9,key: 87  ,type:'white'},
      {num: 9.5,key: 51,type:'black'},
      {num: 10,key: 69  ,type:'white'},
      {num: 11,key: 82  ,type:'white'},
      {num: 11.5,key: 53  ,type:'black'},
      {num: 12,key: 84  ,type:'white'},
      {num: 12.5,key: 54  ,type:'black'},
      {num: 13,key: 89  ,type:'white'},
      {num: 13.5,key: 55  ,type:'black'},
      {num: 14,key: 85  ,type:'white'},
      {num: 15,key: 73  ,type:'white'}
    ]
  },
  methods:{
     //播放音符，附上 id音符號碼/volume(0-1)音量
    playnote: function(id,volume){
      if (id>0){
        //抓取audio中data-num=id的聲音DOM物件
        var audio_obj=$("audio[data-num='"+id+"']")[0];
        audio_obj.volume=volume;  //調整音量
        audio_obj.currentTime=0;  //倒帶到頭
        audio_obj.play();         //播放聲音
      }
    },
    playnext: function(volume){
      var play_note=this.notes[this.now_note_id].num; //播放音符，引數有音符號碼、音量
      console.log(play_note);
      this.playnote(play_note,volume); //把現在正在播放的音符位置移動到下一個
      this.now_note_id+=1;
      
      if (this.now_note_id>=this.now_notes_length){
        this.stopplay();
      }
    },
  //錄音功能
    start_record: function(){
      this.record_time=0,
      this.recorder=setInterval(function(){ //重新定義新的計時器
        vm.record_time++;
      })
    },
//停止錄音功能
    stop_record: function(){
      clearInterval(this.recorder);
      this.record_time=0;
    },
    
    startplay: function(){
      this.now_note_id=0;  //現在指向的音符位置=0
      this.playing_time=0; //現在播放時間歸零
      this.next_note_id=0; //下一個音符=0
      var vobj=this;      //播放的計時器
      this.player=setInterval(function(){
        if (vobj.playing_time>=vobj.notes[vobj.next_note_id].time){
          vobj.playnext(1);
          vobj.next_note_id++;
        }
        vobj.playing_time+=1; //播放時間+1
      },2);
    },
//結束播放
    stopplay: function(){
      clearInterval(this.player);
      this.now_note_id=0;
      this.playing_time=0; //現在播放時間歸零
      this.next_note_id=0;
    },
    //播放時琴鍵有按下去效果，傳入音符id
    get_current_highlight: function(id,skey){
      if (this.now_press_key==skey) return true;
      if (this.notes.length==0) //若譜沒有長度就跳過
        return false
      var cur_id=this.now_note_id-1;
      if (cur_id<0) cur_id=0;
      var num=this.notes[cur_id].num;
      if (num==id) return true;
        return false;
    },
//按下琴鍵時將錄音的紀錄加入樂譜中
    addnote: function(id){
      if (this.record_time>0)
        this.notes.push({num: id,time: this.record_time});
      this.playnote(id,1);
    },
    load_sample: function(){
      var vobj=this;
      $.ajax({
        url: "https://awiclass.monoame.com/api/command.php?type=get&name=music_dodoro",
        success: function(res){
          vobj.notes=JSON.parse(res);
        }
      });
    }
  }
});

//按下鍵盤
$(window).keydown(function(e){
//用電腦鍵盤操控鋼琴鍵盤
  var key = e.which;
  vm.now_press_key=key;
  console.log(key);
  for(var i=0;i<vm.display_keys.length;i++){
    if (key==vm.display_keys[i].key){
      vm.addnote(vm.display_keys[i].num)
    }
  }
});
//放開鍵盤
$(window).keyup(function(){
  vm.now_press_key=-1;
});