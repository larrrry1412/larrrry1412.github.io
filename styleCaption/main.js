/*
variables
*/
var model;
var canvas;
var classNames = [];
var canvas;
var coords = [];
var mousePressed = false;
var mode;
var a=[];

/*
prepare the drawing canvas 
*/
$(function() {
    canvas = window._canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = '#ffffff';
    canvas.isDrawingMode = 0;
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 10;
    canvas.renderAll();
    //recognize once mouse_up
    canvas.on('mouse:up', function(e) {
        getFrame();
        mousePressed = false
    });
    canvas.on('mouse:down', function(e) {
        mousePressed = true
    });
    canvas.on('mouse:move', function(e) {
        recordCoor(e)
    });
})

/*
set the table of the predictions 
*/
function setTable(top5, probs) {
    //loop over the predictions 
    for (var i = 0; i < top5.length; i++) {
        let sym = document.getElementById('sym' + (i + 1))
        let prob = document.getElementById('prob' + (i + 1))
	let b = document.getElementById('b'+ (i + 1))
        sym.innerHTML = top5[i]
	a[i]=top5[i]
	b.innerHTML=top5[i]
        prob.innerHTML = Math.round(probs[i] * 100)
    }
    //create the pie 
    createPie(".pieID.legend", ".pieID.pie");

}

/*
record the current drawing coordinates
*/
function recordCoor(event) {
    var pointer = canvas.getPointer(event.e);
    var posX = pointer.x;
    var posY = pointer.y;

    if (posX >= 0 && posY >= 0 && mousePressed) {
        coords.push(pointer)
    }
}

/*
cause the image data input should be (28,28,1)
so get the best bounding box by trimming around the drawing
will benefit the result
*/
function getMinBox() {
    //get coordinates 
    var coorX = coords.map(function(p) {
        return p.x
    });
    var coorY = coords.map(function(p) {
        return p.y
    });

    //find top left and bottom right corners 
    var min_coords = {
        x: Math.min.apply(null, coorX),
        y: Math.min.apply(null, coorY)
    }
    var max_coords = {
        x: Math.max.apply(null, coorX),
        y: Math.max.apply(null, coorY)
    }

    //return box cordinates
    return {
        min: min_coords,
        max: max_coords
    }
}

/*
get the image data 
*/
function getImageData() {
        //get the minimum bounding box around the drawing 
        const mbb = getMinBox()

        //get image data according to dpi 
        const dpi = window.devicePixelRatio
        const imgData = canvas.contextContainer.getImageData(mbb.min.x * dpi, mbb.min.y * dpi,
                                                      (mbb.max.x - mbb.min.x) * dpi, (mbb.max.y - mbb.min.y) * dpi);
        return imgData
    }

/*
get the prediction 
*/
function getFrame() {
    //make sure we have at least two recorded coordinates 
    if (coords.length >= 2) {

        //get the image data from the canvas 
        const imgData = getImageData()

        //get the prediction 
        const pred = model.predict(preprocess(imgData)).dataSync()

        //find the top 5 predictions 
        const indices = findIndicesOfMax(pred, 5)
        const probs = findTopValues(pred, 5)
        const names = getClassNames(indices)

        //set the table 
        setTable(names, probs)
    }

}

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
load the class names 
*/
async function loadDict() {
    loc = 'model2/class_names.txt'
    
    await $.ajax({
        url: loc,
        dataType: 'text',
    }).done(success);
}

/*
correct the class names by deleting '\n'
*/
function success(data) {
    const lst = data.split(/\n/)
    for (var i = 0; i < lst.length - 1; i++) {
        let symbol = lst[i]
        classNames[i] = symbol
    }
}

/*
get indices of the top probs
*/
function findIndicesOfMax(inp, count) {
    var outp = [];
    for (var i = 0; i < inp.length; i++) {
        outp.push(i); // add index to output array
        if (outp.length > count) {
            outp.sort(function(a, b) {
                return inp[b] - inp[a];
            }); // descending sort the output array
            outp.pop(); // remove the last index (index of smallest element in output array)
        }
    }
    return outp;
}

/*
find the top 5 predictions
*/
function findTopValues(inp, count) {
    var outp = [];
    let indices = findIndicesOfMax(inp, count)
    
    for (var i = 0; i < indices.length; i++)
        outp[i] = inp[indices[i]]
    return outp
}

/*
preprocess the data
*/
function preprocess(imgData) {
    return tf.tidy(() => {
        //convert to a tensor 
        let tensor = tf.fromPixels(imgData, numChannels = 1)
        
        //resize 
        const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat()
        
        //normalize 
        const offset = tf.scalar(255.0);
        const normalized = tf.scalar(1.0).sub(resized.div(offset));

        //add a dimension to get a batch shape 
        const batched = normalized.expandDims(0)
        return batched
    })
}

/*
load the model
*/
async function start(cur_mode) {
    
    mode = cur_mode
    
    //load the model 
    model = await tf.loadModel('model2/model.json')
    
    //warm up 
    model.predict(tf.zeros([1, 28, 28, 1]))
    
    //allow drawing on the canvas 
    allowDrawing()
    
    //load the class names
    await loadDict()
}

/*
allow drawing on canvas
*/
function allowDrawing() {
    canvas.isDrawingMode = 1;
    document.getElementById('status').innerHTML = '开始绘画吧!';
    $('button').prop('disabled', false);
    var slider = document.getElementById('myRange');
    slider.oninput = function() {
        canvas.freeDrawingBrush.width = this.value;
    };
}

/*
submit keywords to main.html
*/
function submitkey1(){
	window.location.href="http://localhost:8080/#/result?keyword="+a[0];
}
function submitkey2(){
	window.location.href="http://localhost:8080/#/result?keyword="+a[1];
}
function submitkey3(){
	window.location.href="http://localhost:8080/#/result?keyword="+a[2];
}
function submitkey4(){
	window.location.href="http://localhost:8080/#/result?keyword="+a[3];
}
function submitkey5(){
	window.location.href="http://localhost:8080/#/result?keyword="+a[4];
}
/*
clear the canvs 
*/
function erase() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    coords = [];
}

function uploadImg(file,imgNum){
   var widthImg = 200; //显示图片的width
   var heightImg = 200; //显示图片的height
   var div = document.getElementById(imgNum);
   if (file.files && file.files[0]){
        div.innerHTML ='<img id="upImg">'; //生成图片
        var img = document.getElementById('upImg'); //获得用户上传的图片节点
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
}


var image;
img.onchange = function () {
    let file = document.querySelector('input[type=file]').files[0]  // 获取选择的文件，这里是图片类型
    let reader = new FileReader()
    reader.readAsDataURL(file) //读取文件并将文件以URL的形式保存在resulr属性中 base64格式
    reader.onload = function(e) { // 文件读取完成时触发 
        let result = e.target.result // base64格式图片地址 
        image = new Image();
        image.src = result // 设置image的地址为base64的地址 
        image.onload = function(){ 
            var canvas = document.querySelector("#canvas"); 
            var context = canvas.getContext("2d"); 
            canvas.width = image.width; // 设置canvas的画布宽度为图片宽度 
            canvas.height = image.height; 
            context.drawImage(image, 0, 0, image.width, image.height) // 在canvas上绘制图片 
            //let dataUrl = canvas.toDataURL('image/jpeg', 0.92) // 0.92为压缩比，可根据需要设置，设置过小会影响图片质量 
            // dataUrl 为压缩后的图片资源，可将其上传到服务器 
        } 
    }
}
