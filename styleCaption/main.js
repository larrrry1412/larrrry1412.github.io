/*
variables
*/
var modelIncep;
var modelstyle;
var a=[];
var idx2word=[];
var word2idx = new Array();
var data;
var flag=1;
var tensor;
/*
load the wordsdict
*/
async function loadDict() {
    loc = 'e0330.txt'
    
    await $.ajax({
        url: loc,
        dataType: 'text',
    }).done(success);
}




/*
correct the wordsdict by deleting '\n'
*/
function success(data) {
    const lst = data.split(/\n/)
    for (var i = 0; i < lst.length - 1; i++) {
        let symbol = lst[i]
	symbol=symbol.trim()
        word2idx[symbol] = i
	idx2word[i] = symbol
    }
	
}


/*
load the model
*/
async function start(mode) {
    //load the model 
    document.getElementById('status').innerHTML = 'wait!';
    modelIncep = await tf.loadModel('modelnew/model.json')
    document.getElementById('status').innerHTML = 'Inception load OK';
    //load the wordsdict
    await loadDict()
    document.getElementById('status').innerHTML = 'dict loaded OK';
    modelstyle = await tf.loadModel('modelstylednew/model.json')
    document.getElementById('status').innerHTML ='style load OK';
    
}


//选择图片后
    function changeFile() {
        createURLImg(myfile.files[0]);
	
	utterThis = new window.SpeechSynthesisUtterance("见你所见，想你所想");
	window.speechSynthesis.speak(utterThis);
    }

    //加载入canvas
    function createURLImg(file,callback) {
        var pen=myCanvas.getContext("2d");
        var imgUrl=URL.createObjectURL(file);
        var image=new Image();
        image.src=imgUrl;
        image.onload=function (ev) {
            pen.drawImage(image,0,0,299,299);
            if(callback) callback();
            URL.revokeObjectURL(imgUrl);
	    //tensorflow 预处理部分 
	    tensor = tf.fromPixels(myCanvas);
        }

        
		

    }
    //提交按钮
    function test() {
        const batched2=tensor.asType('float32');
	const subed=tf.scalar(0.5);
	const xed=tf.scalar(2.0);
	const offset = tf.scalar(255.0);	
	const c1=batched2.div(offset);
	const c2=c1.sub(subed);
	const c3=c2.mul(xed);
	data = c3.expandDims(0);
         
        
	var s=modelIncep.predict(data);
	var zerok = tf.zeros([33,2048],'float32')
	s=s.as2D(1,2048);
	s=s.asType('float32');
        var e = tf.concat([s, zerok]);
	e = e.expandDims(0);
	    //romantic caption
	var start_word=['start'];
	while (true)
	{	
		var par_caps=[];
		for (var i=0;i<start_word.length;i++)
		{
			var str=start_word[i];
			str=str.trim()
			var num=word2idx[str];
			num=parseInt(num)
			par_caps.push(num);
		}
		for (var i=start_word.length;i<34;i++)
		{
			par_caps.push(0);
		}
		par_caps=tf.tensor(par_caps);
		par_caps=par_caps.as2D(1,34);
		var zerok = tf.zeros([33,2],'float32')
		var s1=tf.tensor([[0,1]]);
		s1=s1.asType('float32');
		var midd = tf.concat([s1, zerok]);
		midd = midd.expandDims(0);
		var preds = modelstyle.predict([e,midd,par_caps])
		preds=preds.flatten();
		var d=preds.argMax();
		var s=d.toString();
		s=s.substr(11);
		s=parseInt(s);
		word_pred = idx2word[s]
		start_word.push(word_pred)
		
		if ((word_pred.substring(0, 3)=="end" )|| (start_word.length > 34))
		{
			break;
		}
	}
	console.log("romantic sentence:");
	var sen=[];
	for (var i=1;i<start_word.length-1;i++)
		{
			if(start_word[i].substring(0, 5)=="start"){
			}
			else {
				sen.push(start_word[i]);
			}
		}
	var str=sen.join("");
	console.log(str);
	var utterThis = new window.SpeechSynthesisUtterance("浪漫"+str);
	window.speechSynthesis.speak(utterThis);
	document.getElementById('status1').innerHTML = str;
	//funny caption
	start_word=['start'];
	while (true)
	{	
		var par_caps=[];
		for (var i=0;i<start_word.length;i++)
		{
			var str=start_word[i];
			str=str.trim()
			var num=word2idx[str];
			num=parseInt(num)
			par_caps.push(num);
		}
		for (var i=start_word.length;i<34;i++)
		{
			par_caps.push(0);
		}
		par_caps=tf.tensor(par_caps);
		par_caps=par_caps.as2D(1,34);
		var zerok = tf.zeros([33,2],'float32')
		var s1=tf.tensor([[1,0]]);
		s1=s1.asType('float32');
		var midd = tf.concat([s1, zerok]);
		midd = midd.expandDims(0);
		var preds = modelstyle.predict([e,midd,par_caps])
		preds=preds.flatten();
		var d=preds.argMax();
		var s=d.toString();
		s=s.substr(11);
		s=parseInt(s);
		word_pred = idx2word[s]
		start_word.push(word_pred)
		
		if ((word_pred.substring(0, 3)=="end" )|| (start_word.length > 34))
		{
			break;
		}
	}
	console.log("funny sentence:");
	var sen=[];
	for (var i=1;i<start_word.length-1;i++)
		{
			if(start_word[i].substring(0, 5)=="start"){
			}
			else {
				sen.push(start_word[i]);
			}
		}
	var str=sen.join("");
	console.log(str);
	document.getElementById('status2').innerHTML = str;
	utterThis = new window.SpeechSynthesisUtterance("幽默"+str);
	window.speechSynthesis.speak(utterThis);
	//factual caption
	start_word=['start'];
	while (true)
	{	
		var par_caps=[];
		for (var i=0;i<start_word.length;i++)
		{
			var str=start_word[i];
			str=str.trim()
			var num=word2idx[str];
			num=parseInt(num)
			par_caps.push(num);
		}
		for (var i=start_word.length;i<34;i++)
		{
			par_caps.push(0);
		}
		par_caps=tf.tensor(par_caps);
		par_caps=par_caps.as2D(1,34);
		var zerok = tf.zeros([33,2],'float32')
		var s1=tf.tensor([[0,0]]);
		s1=s1.asType('float32');
		var midd = tf.concat([s1, zerok]);
		midd = midd.expandDims(0);
		var preds = modelstyle.predict([e,midd,par_caps])
		preds=preds.flatten();
		var d=preds.argMax();
		var s=d.toString();
		s=s.substr(11);
		s=parseInt(s);
		word_pred = idx2word[s]
		start_word.push(word_pred)
		
		if ((word_pred.substring(0, 3)=="end" )|| (start_word.length > 34))
		{
			break;
		}
	}
	console.log("factual sentence:");
	var sen=[];
	for (var i=1;i<start_word.length-1;i++)
		{
			if(start_word[i].substring(0, 5)=="start"){
			}
			else {
				sen.push(start_word[i]);
			}
		}
	var str=sen.join("");
	console.log(str);
	document.getElementById('status3').innerHTML = str;
	utterThis = new window.SpeechSynthesisUtterance("简洁"+str);
	window.speechSynthesis.speak(utterThis);
    }
    
    function biafenb(r) {
        if(!pen) pen=myCanvas.getContext("2d");
        pen.save();
        pen.globalAlpha=0.3;
        pen.fillRect(0,(1-r)*200,299,299);
        pen.globalAlpha=1;
        pen.fillStyle = "white";
        pen.font = "20px 微软雅黑";
        pen.textAlign='center';
        pen.fillText(Math.round(r*100)+"%",100,100);
        pen.restore();
    }

    function ajax(formData) {
        $.ajax({
            url:"/bbbbb",
            type:"post",
            Accept:"html/text;chatset=utf-8",
            contentType:false,
            data:formData,
            processData:false,
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                myXhr.upload.onprogress=function (ev) {
                    pen.clearRect(0,0,299,299);
                    createURLImg(myfile.files[0],function () {
                        biafenb(ev.loaded/ev.total);
                    })
                }
                return myXhr;
            }, success: function (data) {
                console.log("上传成功!!!!");
            }, error: function () {
                console.log("上传失败！");
            }
        })
    }
