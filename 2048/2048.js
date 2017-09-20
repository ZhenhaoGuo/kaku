function setCookie(cname,val){
	var date=new Date();
	date.setDate(date.getDate()+14);
	document.cookie="cname"+"="+val+";expires="+date.toGMTString();
}
function getCookie(cname){
	var str=document.cookie;
	var i=str.indexOf(cname);
	if(i!=-1){
		i+=cname.length+1;
		var endi=str.indexOf(";",i);
		return str.slice(i,endi!=-1?endi:str.length);
	}
}
var game={
	data:null,
	RN:4,
	CN:4,
	CSIZE:100,
	OFFSET:16,
	score:0,
	top:0,
	state:1,//保存游戏状态
	RUNNING:1,
	GAMEOVER:0,
	//强调：
		//1、对象自己的方法，用到对象自己的属性，必须加this
		//2、每个属性和方法之间，都要用逗号分隔
	init:function(){
		this.top=getCookie("top")||0;
		for(var r=0,arr=[];r<this.RN;r++)
			for(var c=0;c<this.CN;c++)
			arr.push(""+r+c);
		var html='<div id="g'+arr.join('" class="grid"></div><div id="g')+'" class="grid"></div>';
		html+='<div id="c'+arr.join('" class="cell"></div><div id="c')+'" class="cell"></div>';
		//查找id为gridPanel的div，设置其内容为html
			var gp=document.getElementById("gridPanel");
			gp.innerHTML=html;
		//计算容器宽width:CN*(CSIZE+OFFSET)+OFFSET
			var width=this.CN*(this.CSIZE+this.OFFSET)+this.OFFSET;
		//计算容器高height:RN*(CSIZE+OFFSET)+OFFSET
			var height=this.RN*(this.CSIZE+this.OFFSET)+this.OFFSET;
		//设置id为gridPanel的div的style的宽为width
			gp.style.width=width+"px";
		//设置id为gridPanel的div的style的高为height
			gp.style.height=height+"px";
	},
	start:function(){//启动游戏
		this.init();
		this.score=0;//重置分数
		this.state=this.RUNNING;//重置游戏状态为运行
		//创建空数组保存到data属性
		this.data=[];
		//r从0开始，到<RN结束
		for(r=0;r<this.RN;r++){
			//向data中 压入一个空数组
			this.data.push([]);
			//c从0开始，到<CN结束
			for(c=0;c<this.CN;c++){
				//想data中r行的子数组压入一个0
				this.data[r].push(0);
			}
		}
		this.randomNum();
		this.randomNum();
		this.updateView();
		//为页面绑定键盘按下
		document.onkeydown=function(e){
			//获得按键编号
			switch(e.keyCode){
				case 37:this.moveLeft(); break;
				case 38: this.moveUp();break;
				case 39:this.moveRight();break;
				case 40: this.moveDown();break;
			}
		}.bind(this);
	},
	randomNum:function(){
		while(true){
			var r=parseInt(Math.random()*this.RN);
			var c=parseInt(Math.random()*this.CN);
			if(this.data[r][c]==0){
				this.data[r][c]=Math.random()<0.7?2:4;
				break;
			}
		}
	},
	updateView:function(){//将data的数据更新到页面
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var div=document.getElementById("c"+r+c);
				if(this.data[r][c]!=0){
					div.innerHTML=this.data[r][c];
					div.className="cell n"+this.data[r][c];
				}else{
					div.innerHTML="";
					div.className="cell";
				}
			}
		}
		//找到id为score的div，设置其内容为score
		document.getElementById("score").innerHTML=this.score;
		document.getElementById("top").innerHTML=this.top;
		var gameOver=document.getElementById("gameOver");
		if(this.state==this.GAMEOVER){
			gameOver.style.display="block";
			document.getElementById("fScore").innerHTML=this.score;
		}else{
			gameOver.style.display="none";
		}
	},
	//移动
	move:function(fun){
		var before=String(this.data);
		fun();
		var after=String(this.data);
		if(before!=after){
			this.randomNum();
			if(this.isGameOver()){
				this.state=this.GAMEOVER;
				if(this.score>this.top){
					setCookie("top",this.score);
				}
			}
			this.updateView();
		}
	},
	isGameOver:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0){
					return false;
				}
				if(c<this.CN-1&&this.data[r][c]==this.data[r][c+1]){
					return false;
				}
				if(r<this.RN-1&&this.data[r][c]==this.data[r+1][c]){
					return false;
				}
			}
		}
		return true;
	},
	//左移
	moveLeft:function(){
		this.move(function(){
			for(r=0;r<this.RN;r++){
				this.moveLeftInRow(r);
			}
		}.bind(this));
	},
	moveLeftInRow:function(r){
		for(var c=0;c<this.CN-1;c++){
			var nextc=this.getNextInRow(r,c);
			if(nextc==-1){break;}
			else{
				if(this.data[r][c]==0){
					this.data[r][c]=this.data[r][nextc];
					this.data[r][nextc]=0;
					c--;
				}else if(this.data[r][c]==this.data[r][nextc]){
					this.data[r][c]*=2;
					this.score+=this.data[r][c];
					this.data[r][nextc]=0;
				}
			}
		}
	},
	getNextInRow:function(r,c){
		for(var nextc=c+1;nextc<this.CN;nextc++){
			if(this.data[r][nextc]!=0)
				return nextc;
		}
		return -1;
	},
	//右移
	moveRight:function(){
		this.move(function(){
			for(r=0;r<this.RN;r++){
				this.moveRightInRow(r);
			}
		}.bind(this));
	},
	moveRightInRow:function(r){
		for(var c=this.CN-1;c>0;c--){
			var prevc=this.getPrevInRow(r,c);
			if(prevc==-1){break;}
			else{
				if(this.data[r][c]==0){
					this.data[r][c]=this.data[r][prevc];
					this.data[r][prevc]=0;
					c++;
				}else if(this.data[r][c]==this.data[r][prevc]){
					this.data[r][c]*=2;
					this.score+=this.data[r][c];
					this.data[r][prevc]=0;
				}
			}
		}
	},
	getPrevInRow:function(r,c){
		for(var Prevc=c-1;Prevc>=0;Prevc--){
			if(this.data[r][Prevc]!=0)
				return Prevc;
		}
		return -1;
	},
	
	//上移
	moveUp:function(){
		this.move(function(){
			for(c=0;c<this.CN;c++){
				this.moveUpInCol(c);
			}
		}.bind(this));
	},
	moveUpInCol:function(c){
		for(var r=0;r<this.RN-1;r++){
			var nextr=this.getNextInCol(r,c);
			if(nextr==-1){break;}
			else{
				if(this.data[r][c]==0){
					this.data[r][c]=this.data[nextr][c];
					this.data[nextr][c]=0;
					r--;
				}else if(this.data[r][c]==this.data[nextr][c]){
					this.data[r][c]*=2;
					this.score+=this.data[r][c];
					this.data[nextr][c]=0;
				}
			}
		}
	},
	getNextInCol:function(r,c){
		for(var nextr=r+1;nextr<this.RN;nextr++){
			if(this.data[nextr][c]!=0)
				return nextr;
		}
		return -1;
	},
	//下移
	moveDown:function(){
		this.move(function(){
			for(r=0;r<this.RN;r++){
				this.moveDownInCol(r);
			}
		}.bind(this));
	},
	moveDownInCol:function(c){
		for(var r=this.RN-1;r>0;r--){
			var Prevr=this.getPrevInCol(r,c);
			if(Prevr==-1){break;}
			else{
				if(this.data[r][c]==0){
					this.data[r][c]=this.data[Prevr][c];
					this.data[Prevr][c]=0;
					r++;
				}else if(this.data[r][c]==this.data[Prevr][c]){
					this.data[r][c]*=2;
					this.score+=this.data[r][c];
					this.data[Prevr][c]=0;
				}
			}
		}
	},
	getPrevInCol:function(r,c){
		for(var Prevr=r-1;Prevr>=0;Prevr--){
			if(this.data[Prevr][c]!=0)
				return Prevr;
		}
		return -1;
	}
}
//页面加载后，自动启动游戏
window.onload=function(){
	game.start();
}
//debug:
//1.debugger：让程序停在关键位置，鼠标移入可能出错的变量，实时
