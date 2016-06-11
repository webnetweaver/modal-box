<!--*****************************************modal script********************************************************-->

var bodyEle;
var currentZ = 9999998;
var overlaydivindex=0;
var modalexists = false;
var overlayexists = false;
var modalWindowHandles = new Array();
var currentWindowHandle = "";

function initoverlay()
{
	bodyEle = document.getElementsByTagName("body")[0];
	var overlay = document.createElement('div');
	overlay.setAttribute("id","modal_overlay");
	bodyEle.insertBefore(overlay,document.getElementById("container"));
	var eles = bodyEle.getElementsByTagName("div");
	for(i=0;i<eles.length;i++)
		if(eles[i].getAttribute("id") == "modal_overlay")
		{
			overlaydivindex = i;//index into the body childnodes array of the overlay div
			break;
		}
	overlay.style.height=pageHeight()+'px'; //set the size of the transparent overlay
	overlay.style.width=pageWidth()+'px'; 
	overlayexists = true;
}

function findWindow(contentID)
{
	for(i=0;i<modalWindowHandles.length;i++)
		if(modalWindowHandles[i] == contentID)
			return i;
	return false;
}

function getModalDiv(modalindex)
{
	var containerindex = 0;
	var eles = bodyEle.getElementsByTagName("div");
	for(i=overlaydivindex + 1;i<eles.length;i++)
		if(eles[i].className == "modal_container")
		{
			if(containerindex == modalindex)
				return eles[i];
			else
				containerindex+=1;
		}
}	

function floatWindow(index)
{
	modalWindowHandles.push(modalWindowHandles[index]);//re-add the window the array
	currentWindowHandle = modalWindowHandles[index];
	modalWindowHandles.splice(index,1); //remove from the array
	var overlay = document.getElementById("modal_overlay");
	var container = document.createElement("div"); 
	var oldwindow = getModalDiv(index);//clone the old one
	container.className = "modal_container";
	var contentObject = document.getElementById(currentWindowHandle);//the original hidden object
	container.innerHTML = oldwindow.innerHTML; //the old object pending removal
	container.style.top = contentObject.style.top;
	container.style.left = contentObject.style.left;
	container.style.width = contentObject.style.width;
	container.style.height = contentObject.style.height; 
	currentZ+=1;
	container.style.zIndex = currentZ;
	bodyEle.removeChild(oldwindow); //remove the old one
	bodyEle.insertBefore(container,document.getElementById("container")); // add the clone

	
}
	

function pushmodal(contentID, callback)
{
	if(currentWindowHandle!=contentID)
	{
		if(!overlayexists)
				initoverlay(); //set up veil
		var overlay = document.getElementById("modal_overlay");
		var foundWindow = findWindow(contentID);
		if(!foundWindow)
		{	
			var container = document.createElement("div");
			var content = document.createElement("div");
			container.className = "modal_container";
			container.appendChild(content);
			var contentObject = document.getElementById(contentID);
			content.innerHTML = contentObject.innerHTML;
			if(contentObject.style.top.indexOf("%")==-1)
				container.style.top = contentObject.style.top;
			else
			{
				max = parseInt(overlay.style.height.replace("px",""));
				extent = parseInt(contentObject.style.height.replace("px",""));
				pos = Math.floor(max*parseInt(contentObject.style.top.replace("%",""))/100) - extent/2;
				pos = Math.max(Math.min(pos,max-extent),0);
				container.style.top = pos+"px";
			}
			if(contentObject.style.left.indexOf("%")==-1)
				container.style.left = contentObject.style.left;
			else
			{
				max = parseInt(overlay.style.width.replace("px",""));
				extent = parseInt(contentObject.style.width.replace("px",""));
				pos = Math.floor(max*parseInt(contentObject.style.left.replace("%",""))/100) - extent/2;
				pos = Math.max(Math.min(pos,max-extent),0);
				container.style.left = pos+"px";
			}
			container.style.width = contentObject.style.width;
			container.style.height = contentObject.style.height;
			currentZ+=1;
			container.style.zIndex = currentZ;
			bodyEle.insertBefore(container,document.getElementById("container"));
			modalWindowHandles.push(contentID);
			currentWindowHandle = contentID;
			if(!modalexists)
				showmodal();//display the modal window veil
			container.style.display = "block";//display the modal dialog
			if(callback!="")
				eval(callback);	
		}
		else
			floatWindow(foundWindow);
	}
}

function popmodal()
{
	var numDialogs = modalWindowHandles.length; //# of dialogs before popping
	if(numDialogs >= 1)
	{	
		var oldwindow = getModalDiv(numDialogs - 1);
		modalWindowHandles.pop();
		//alert("div: "+getModalDiv(numDialogs - 1).nodeName);
		bodyEle.removeChild(oldwindow); //remove the old one
		if(numDialogs >= 2)
		{
			currentWindowHandle = modalWindowHandles[numDialogs - 2];
			currentZ = getModalDiv(numDialogs - 2).zIndex;//body element childnodes index is offset by overlay div
		}
		else
		{
			currentWindowHandle = "";
			currentZ = 9999998;
			hidemodal();
		}
	}

}

function closemodal()
{
	var numDialogs = modalWindowHandles.length;
	if(numDialogs>=1)
	for(i=0;i<numDialogs;i++)
		popmodal();

}

function showmodal()
{
	finalize('hidden');	//hide all selects, iframes, and objects
	document.getElementById("modal_overlay").style.display='block'; //set display to none
	modalexists = true;
}

function hidemodal()
{
	document.getElementById("modal_overlay").style.display='none'; //set display to none
	finalize('visible');  //show all selects, iframes, and objects
	modalexists = false;
}

function pageHeight()
{
	var standardbody=(document.compatMode=="CSS1Compat")? document.documentElement : document.body; //create reference to common "body" across doctypes
	var height=(standardbody.offsetHeight>standardbody.scrollHeight)? standardbody.offsetHeight : standardbody.scrollHeight;
	return height;
}


function pageWidth()
{
	var ie=document.all && !window.opera;
	var standardbody=(document.compatMode=="CSS1Compat")? document.documentElement : document.body; //create reference to common "body" across doctypes
	var domclientWidth=document.documentElement && parseInt(document.documentElement.clientWidth) || 100000; //Preliminary doc width in non IE browsers
	var width=(ie)? standardbody.clientWidth : (/Safari/i.test(navigator.userAgent))? window.innerWidth : Math.min(domclientWidth, window.innerWidth-16);
	return width;
}


function finalize(h)
{
	tag=document.getElementsByTagName('select');
	for(i=tag.length-1;i>=0;i--)
		tag[i].style.visibility=h;
	tag=document.getElementsByTagName('iframe');
	for(i=tag.length-1;i>=0;i--)
		tag[i].style.visibility=h;
	tag=document.getElementsByTagName('object');
	for(i=tag.length-1;i>=0;i--)
		tag[i].style.visibility=h;
	tag=document.getElementsByTagName('embed');
	for(i=tag.length-1;i>=0;i--)
		tag[i].style.visibility=h;
}

<!--*************************************************end modal script***********************************************************************-->
