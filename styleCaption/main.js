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
    document.getElementById('status').innerHTML = 'inception OK';
    //load the wordsdict
    await loadDict()
    document.getElementById('status').innerHTML = 'dict OK';
    modelstyle = await tf.loadModel('modelstyled4/modelstyled4/model.json')
    document.getElementById('status').innerHTML ='style OK';
    
    
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
	console.log("hj");
	data = c3.expandDims(0);
         
        
	var s=modelIncep.predict(data);
	console.log(s);
	var zerok = tf.zeros([33,2048],'float32')
        var e = tf.concat(s, zerok, 0)
	e = e.expandDims(0);
	console.log(e);
	while (True)
	{
		var par_caps=[];
		for (var i=0;i<start_word.length;i++)
		{
			par_caps.push(word2idx[i]);
		}
		for (var i=start_word.length;i<34;i++)
		{
			par_caps.push(0);
		}

		preds = decoder_model.predict([e,tf.tensor([[1,0]]), tf.tensor(par_caps)])
		word_pred = idx2word[tf.argmax(preds[0])]
		start_word.push(word_pred)

		if ((word_pred == "end" )|| (len(start_word) > 34))
		{
			break;
		}
	}	
	var sen=[];
	for (var i=1;i<start_word.length-1;i++)
		{
			sen.push(start_word[i]);
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
