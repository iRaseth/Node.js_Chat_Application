module.exports = {
  sayHello : function(){
    let random = Math.floor(Math.random()*3);
    let array = ['Hello, ','Hi, ','Welcome to our app, '];
      return array[random];
  },
  pickColor : function(){
    let color = [];
    for(let i = 0;i < 3;i++){
      let stMix = Math.floor(Math.random()*100)+10;
      let ndMix = Math.floor(Math.random()*100)+100;
      let rgb = Math.floor(Math.random()*stMix)+ndMix;
      color.push(rgb);
    }
    return color;
  }
}
