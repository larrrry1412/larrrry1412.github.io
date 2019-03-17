/*
variables
*/
var modelIncep;
var modelstyle;
var a=[];
var idx2word=[];
var word2idx = new Array();

/*
get the the class names 
*/
function getClassNames(indices) {
    var outp = []
    for (var i = 0; i < indices.length; i++)
        outp[i] = classNames[indices[i]]
    return outp
}


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
preprocess the data
*/
function preprocess(imgData) {
    return tf.tidy(() => {
        //convert to a tensor 
        let tensor = tf.fromPixels(imgData, numChannels = 1)
        
        //normalize 
        const offset = tf.scalar(255.0);
        const normalized = tf.scalar(1.0).sub(tensor.div(offset));

        //add a dimension to get a batch shape 
        const batched = normalized.expandDims(0)
        return batched
    })
}

/*
load the model
*/
async function start() {
    
    //load the model 
    document.getElementById('status').innerHTML = 'za!';
    modelIncep = await tf.loadModel('modelnew/model.json')
    //modelstyle = await tf.loadModel('modelstyle/model.json')
    document.getElementById('status').innerHTML = '开始绘画吧!';
    
    //load the wordsdict
    //await loadDict()
}


function uploadImg(file,imgNum){
   var widthImg = 299; //显示图片的width
   var heightImg = 299; //显示图片的height
   var div = document.getElementById(imgNum);
   if (file.files && file.files[0]){
        div.innerHTML ='<img id="upImg">'; //生成图片
        img = document.getElementById('upImg'); //获得用户上传的图片节点
        img.onload = function(){
			img.width = widthImg;
			img.height = heightImg;
		}
		var reader = new FileReader(); //判断图片是否加载完毕	
		reader.onload = function(evt){
			if(reader.readyState === 2){ //加载完毕后赋值
				img.src = evt.target.result;
			}
		}
		reader.readAsDataURL(file.files[0]); 
	}
	var pred = modelIncep.predict(preprocess(img))
	document.getElementById("test1").innerHTML="pred";

	start_word = ["start"]
	e = [pred]
	zerok = np.zeros(shape=(33,2048))
	e = np.append(e, zerok, axis = 0)
	while True:
		par_caps = [word2idx[i] for i in start_word]
		par_caps = sequence.pad_sequences([par_caps], maxlen=max_len, padding='post')

		preds = modelstyle.predict([np.array([e]),np.array([[1,0]]), np.array(par_caps)])
		word_pred = idx2word[np.argmax(preds[0])]
		start_word.append(word_pred)

		if word_pred == "end" or len(start_word) > max_len:
			break

	var caption = start_word[1:-1]
}
