addEvent = document.addEventListener?//事件注册 兼容代码IE6、7、8
	function(elem,type,listener,useCapture){
		elem.addEventListener(type,listener,useCapture);
	}:
	function(elem,type,listener,useCapture){
		elem.attacheEvent('on'+type,listener);
	};

//注册事件
var clo_yellow=document.getElementById("clo_yellow");
addEvent(clo_yellow,'click',clowindow,false);
var login_close=document.getElementById("login_close");
addEvent(login_close,'click',clowindow,false);
var foc=document.getElementById("foc");
addEvent(foc,'click',follow,false);
var unfoc=document.getElementById("unfoc");
addEvent(unfoc,'click',unfollow,false);
var banner_control=document.getElementById("banner_control");
var control_items=document.getElementsByClassName("control_item");
for(i=0;i<control_items.length;i++){
	addEvent(control_items[i],'click',banner_click,false)
}
function banner_click(event) {
	var page=event.target.dataset.page;
	var n=Number(page);
	banner_change(n);
	banner_contorl_change(n);
}
function follow() {
	if(sessionStorage.getItem("loginSuc")==1){
		sessionStorage.setItem("followSuc",1);
		foc.style.display="none";
		unfoc.style.display="block";
	}else{
		showLogin();
	}
}
function unfollow() {
	sessionStorage.setItem("followSuc",0);	
	unfoc.style.display="none";
	foc.style.display="block";
}
function clowindow(event) {
	event=event||window.event;//兼容调用	
	event.target.parentNode.parentNode.style.display="none";
}
function showLogin() {
	//判断LocalStorage是否已登录
	//若未登录
	var login_back=document.getElementById("login_back");
	login_back.style.display="block";
}
function login_submit() {
	var inputs=document.getElementById("login_form").getElementsByTagName("input");
	var userName=inputs[0].value,
		password=inputs[1].value;
		userName=md5(userName);
		password=md5(password);
	var xhr=new XMLHttpRequest();
				//get请求
				var url="http://study.163.com/webDev/login.htm";//相对当前文档路径
				xhr.open('get',url+'?'+'userName='+userName+'&password='+password,true);	
				xhr.send(null);		
				xhr.onreadystatechange=function(){			
					if (xhr.readyState==4&&xhr.status==200){
						var resp=xhr.responseText;
						if(resp==1) {
							sessionStorage.setItem("loginSuc",1);
							sessionStorage.setItem("followSuc",1);
							foc.style.display="none";
							unfoc.style.display="block";
							login_close.click();
						}
						if(resp==0) {
							sessionStorage.setItem("loginSuc",0);
						}
					}
				}
}
//banner以及初始化
var banner=document.getElementById("banner");
var banner_inner=document.getElementById("banner_inner");
var items=banner_inner.getElementsByClassName("item");
items[0].getElementsByTagName("img")[0].style.opacity="1";
var control_items=document.getElementsByClassName("control_item");
// 计时
var setInt=setInterval(banner_slide,5000);
banner.addEventListener('mouseover', function (event) {clearInterval(setInt);});
banner.addEventListener('mouseout', function () {setInt=setInterval(banner_slide,5000);});
//幻灯片样式切换
function banner_slide() {
	var n;
	for(i=0;i<items.length;i++){
		if(items[i].className.indexOf("banner_active")!=-1) n=i;		
	}
	n=(n+1)%3;
	banner_change(n);
	banner_contorl_change(n);
}
function banner_change(m) {
	for(i=0;i<items.length;i++){		
		items[i].className = items[i].className.replace(/\s?banner_active/, '');		
	}
	items[m].getElementsByTagName("img")[0].style.opacity="0";
	items[m].className+=" banner_active";
	setTimeout(function(){items[m].getElementsByTagName("img")[0].style.opacity="1";},2);
}
var course=document.getElementById("course");
var course_units=document.getElementsByClassName("course_unit");


//用于重构
var table=course.getElementsByTagName("table")[0];
var tbody=table.getElementsByTagName("tbody")[0];
var course_nav=document.getElementById("course_nav");
var course_class=course_nav.getElementsByTagName("a");
addEvent(course_nav,'click',course_change,false);


function course_change(event) {
	var m=Number(event.target.dataset.courseclass);
	var n=Number(event.target.dataset.coursepage);
	//清除样式
	for(i=0;i<course_class.length;i++){		
		course_class[i].className = course_class[i].className.replace(/nav_active/, '');
	}
	//根据序号赋active
	course_class[m].className="nav_active";
	//Ajax重构
	m=(m+1)*10;
	ajaxReconstruct(n,m);	
}

function banner_contorl_change(m) {
	for(i=0;i<items.length;i++){		
		control_items[i].className=control_items[i].className.replace(/\s?control_active/,'');		
	}
	control_items[m].className+=" control_active";
}
function ajaxReconstruct(pageNo,type) {
	//根据序号m发送Ajax请求重构页面
	var psize=20;
	var listJs;	
	var xhr=new XMLHttpRequest();
	//get请求
	var url="http://study.163.com/webDev/couresByCategory.htm";//相对当前文档路径
	xhr.open('get',url+"?pageNo="+pageNo+"&psize="+psize+"&type="+type+"",true);	
	xhr.send(null);
	xhr.onreadystatechange=function(){			
		if (xhr.readyState==4&&xhr.status==200){
			console.log("have sent");
			listJs=JSON.parse(xhr.responseText);
			//重构列表
			tbody.innerHTML='';		
			var nowJsObj=[];
			for(a=0;a<listJs.list.length;a++){
				if(a%4==0) tbody.innerHTML+="<tr></tr>";
					nowJsObj=listJs.list[a];
					tbody.lastChild.innerHTML+='\
					<td>\
						<div class="course_unit" data-seq="'+a+'">\
							<img src="'+nowJsObj.middlePhotoUrl+'">\
							<p>'+nowJsObj.name+'</p>\
							<p>'+nowJsObj.provider+'</p>\
							<p><label>&nbsp&nbsp&nbsp&nbsp'+nowJsObj.learnerCount+'</label></p>\
							<p>￥'+nowJsObj.price+'</p>\
							<div class="course_hover">\
								<div>\
									<img src="'+nowJsObj.middlePhotoUrl+'">\
									<div class="right_inner">\
										<p>'+nowJsObj.name+'</p>\
										<p><label></label>&nbsp&nbsp&nbsp&nbsp&nbsp'+nowJsObj.learnerCount+'人在学</p>\
										<div>发布者：'+nowJsObj.provider+'</div>\
										<div>分类：'+nowJsObj.catagoryName+'</div>\
									</div>\
								</div>\
								<div>\
									<p>'+nowJsObj.description+'</p>\
								</div>\
							</div>\
						</div>\
					</td>\
					';				
			}
			for(i=0;i<listJs.list.length;i++) {
				course_units[i].getElementsByTagName("img")[0].onmouseenter=function () {
					var seq=event.target.parentNode.dataset.seq;
					console.log("mouseenter");
					var course_hover=event.target.parentNode.getElementsByClassName("course_hover")[0];	
					course_hover.style.display="block";
					course_hover.onmouseleave=function () {	
					console.log("mouseleave");				
					course_hover.style.display="none";
					};
				};
			}	
		};
	};
}
var page=document.getElementById("page");
var page_items=page.getElementsByTagName("a");
page.onclick=function() {
	var type;
	var page,lastpage;
	for(i=0;i<course_class.length;i++){		
		if(course_class[i].className.indexOf("nav_active")!=-1){
			type=[i+1]*10;
		}
	}
	for(i=0;i<page_items.length;i++) {
		if(page_items[i].className.indexOf("active")!=-1) lastpage=i;
	}
	page=event.target.innerText;
	if(page!='>'&&page!='<') {
		var pages=event.target.parentNode.childNodes;
		for(i=0;i<pages.length;i++) {
			pages[i].className='';
		}
		event.target.className+="active";
		ajaxReconstruct(page,type);
	}

}
function pre_page(){
	var active=event.target.parentNode.getElementsByClassName("active")[0];
	var newPage=Number(active.innerText)-1;
	var type,flag;
	for(i=0;i<course_class.length;i++){		
		if(course_class[i].className.indexOf("nav_active")!=-1){
			type=[i+1]*10;
		}
	}
	if(newPage!=0){
		ajaxReconstruct(newPage,type);
		active.className='';
		page_items[newPage].className+="active";
	}
}
function next_page(){
	var active=event.target.parentNode.getElementsByClassName("active")[0];
	var newPage=Number(active.innerText)+1;
	var type,flag;
	for(i=0;i<course_class.length;i++){		
		if(course_class[i].className.indexOf("nav_active")!=-1){
			type=[i+1]*10;
		}
	}
	if(newPage<page_items.length-1){
		console.log('newPage='+newPage+' page_items.length='+page_items.length);
		ajaxReconstruct(newPage,type);
		active.className='';
		page_items[newPage].className+="active";
	}
}
window.onload=function() {
	if(sessionStorage.getItem("loginSuc")==1&&sessionStorage.getItem("followSuc")==1){
		foc.style.display="none";
	}
	if(sessionStorage.getItem("followSuc")!=1) unfoc.style.display="none";
	ajaxReconstruct(1,10);
}
