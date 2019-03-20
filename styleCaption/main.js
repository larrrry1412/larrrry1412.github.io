/*
variables
*/
var modelIncep;
var modelstyle;
var a=[];
var idx2word=[];
var word2idx = new Array();
var data;


/*
load the wordsdict
*/
async function loadDict() {
    loc = 'e.txt'
    
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
	var s=word2idx['start']
	var d=idx2word[s]
	console.log(d)
	s=parseInt(s)
	console.log(s)
	d=idx2word[s]
	console.log(d)
	var e=d.length()
	console.log(e)
}


/*
load the model
*/
async function start(mode) {
    //load the model 
    document.getElementById('status').innerHTML = 'wait!';
    //modelIncep = await tf.loadModel('modelnew/model.json')
    //document.getElementById('status').innerHTML = 'inception OK';
    //load the wordsdict
    await loadDict()
    document.getElementById('status').innerHTML = 'dict OK';
    //modelstyle = await tf.loadModel('modelstyled4/modelstyled4/model.json')
    //document.getElementById('status').innerHTML ='style OK';
    
    
}


//选择图片后
    function changeFile() {
        createURLImg(myfile.files[0]);
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
        }

        //tensorflow 预处理部分 
        var tensor = tf.fromPixels(myCanvas);
		
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
	var start_word=['start'];
	while (true)
	{	
		var par_caps=[];
		for (var i=0;i<start_word.length;i++)
		{
			par_caps.push(word2idx[start_word[i]]);
		}
		for (var i=start_word.length;i<34;i++)
		{
			par_caps.push(0);
		}
		par_caps=tf.tensor(par_caps);
		par_caps=par_caps.as2D(1,34);
		var preds = modelstyle.predict([e,tf.tensor([[1,0]]),par_caps])
		preds=preds.flatten();
		console.log(preds);
		var d=preds.argMax();
		var s=d.toString();
		s=s.substr(11);
		s=parseInt(s);
		word_pred = idx2word[s]
		console.log(word_pred)
		start_word.push(word_pred)
		
		if ((word_pred.substring(0, 3)=="end" )|| (start_word.length > 34))
		{
			break;
		}
	}
	console.log("sentence:");
	var sen=[];
	for (var i=1;i<start_word.length-1;i++)
		{
			if(start_word[i].substring(0, 5)=="start"){
				sen.push(" ");
			}
			else {
				sen.push(start_word[i]);
			}
		}
	console.log(sen);
	document.getElementById('status').innerHTML = sen;

    }
    //提交按钮
    function test() {
        myCanvas.toBlob(function (result) {
            var form=new FormData();
            form.append("xxx",result);
            ajax(form);
        })
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
