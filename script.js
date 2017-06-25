function EventListener(obj,evt,fnc,useCapture){
	if (!useCapture) useCapture=false;
	if (obj.addEventListener){
		obj.addEventListener(evt,fnc,useCapture);
		return true;
	} else if (obj.attachEvent) return obj.attachEvent("on"+evt,fnc);
	else{
		MyAttachEvent(obj,evt,fnc);
		obj['on'+evt]=function(){ MyFireEvent(obj,evt) };
	}
} 

function MyAttachEvent(obj,evt,fnc){
	if (!obj.myEvents) obj.myEvents={};
	if (!obj.myEvents[evt]) obj.myEvents[evt]=[];
	var evts = obj.myEvents[evt];
	evts[evts.length]=fnc;
}
function MyFireEvent(obj,evt){
	if (!obj || !obj.myEvents || !obj.myEvents[evt]) return;
	var evts = obj.myEvents[evt];
	for (var i=0,len=evts.length;i<len;i++) evts[i]();
} 

////------------------------------------------------------------------------
////------------------------------------------------------------------------

function WebPEncDemo() {
	var encInCanvas = document.getElementById("encoderInputCanvas"),
	encInContext = encInCanvas.getContext("2d"),
	img = document.createElement("img"),
	method = 0,
	encodeBtn = document.getElementById('encodeBtn'),
	encSaveBtn = document.getElementById('encSaveBtn'),
	encSpeedResult = document.getElementById('encSpeedResult'),
	encOutputWebPImage = document.getElementById('encOutputWebPImage'),
	base64URI='';
	//Init();
	encodeBtn.disabled=true; encSaveBtn.disabled=true;
	
	clearCanvas = function () {
		encInContext.clearRect(0, 0, encInCanvas.width, encInCanvas.height);
	};
	resizeCanvas = function () {
		encInCanvas.width=img.width;
		encInCanvas.height=img.height;
	}
		
	if (typeof FileReader !== "undefined")	
	encInContext.fillText("Drop an image here and press the \"encode\" button ", 30, 80);
	else
	encInContext.fillText("Choise an sample image", 86, 80);
		
	EventListener(img,"load", function () {
		clearCanvas();
		resizeCanvas();
		encInContext.drawImage(img, 0, 0);
		finishInit();
	}, false);
	
	EventListener(encInCanvas,"dragenter", function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	EventListener(encInCanvas,"dragover", function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	EventListener(encInCanvas,"drop", function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
		
		var files = evt.dataTransfer.files;
		if (files.length > 0) {
			var file = files[0];
			if (typeof FileReader !== "undefined") {
				if (file.type.indexOf("image") != -1) {
					var freader = new FileReader();
					freader.onload = function (evt) {
						ImageToCanvas(evt.target.result);
					};
					freader.readAsDataURL(file);
				} else {
					alert('Your Browser don\'t support the Filereader API');
				}
			}
		}
	}, false);
	
	EventListener(encodeBtn,"click", function (evt) {
		/*var qualityVal=Number(quality.value);
		var qualityValChange=	(isNaN(qualityVal)?true:(qualityVal>100?true:(qualityVal<0?true:false)));
			qualityVal		=	(isNaN(qualityVal)?75:	(qualityVal>100?100:(qualityVal<0?0:qualityVal)));
		
		if (qualityValChange) {
			alert ('Error in "quality" field! Value change now! Click "encode"-button, again');
			quality.value=qualityVal;
			return;
		}*/
		qualityVal = checkIntVal($('#enc-option-quality').val(),75);
		encodeBtn.disabled=true;
		encodeBtn.value = 'encoding...';
		WebPEncodeAndDraw(qualityVal);
		encodeBtn.disabled=false;
		encodeBtn.value = 'Finish! Encode again';
	}, false);
	
	EventListener(encSaveBtn,"click", function (evt) {
		document.location.href="data:image/webp;base64,"+base64URI;//octet-stream
	}, false);
	
	
	//create encode options
	
	//create select-option(s)
	function createSelect(path, desc, selectValues) {
		var sElement = $(document.createElement("select")).attr('id', 'enc-option-'+desc.o);
		path.append("<acronym title=\""+desc.a+"\">"+desc.n+"</acronym>: ");
		path.append(sElement);
		path.append(desc.l+" - ");
		
		$.each(selectValues, function(key, value)
		{   
			 $('#enc-option-'+desc.o).
				  append($("<option></option>").
				  attr("value",key).
				  text(value)); 
		});
	}
	//create edit-field with min-max, length
	function createInputText(path, desc, selectValues) {
		var sElement = $(document.createElement("input"));
		sElement.attr('id', 'enc-option-'+desc.o);
		sElement.attr('type', 'text');
		
		$.each(selectValues, function(key, value)
		{   
			 sElement.attr(key, value); 
		});
		path.append("<acronym title=\""+desc.a+"\">"+desc.n+"</acronym>: ");
		path.append(sElement);
		path.append(desc.l+" - ");
	}
	//f:opinion, n:name, a, acronym descirption, l: descriotion after field	
	//descValues = {"f":"m","n":"Method:","a":"Method:","l":"Method:"};
	//selectValues = {"1":"test 1","2":"test 2"};
	//method
	createSelect($('#enc-options'), 
				   {"o":"method","n":"Method","a":"quality/speed trade-off (0=fast, 6=slower-better)","l":""}, 
				   {"0":"0 fast","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6 slower-better"}
				 );
	//quality
	createInputText($('#enc-options'), 
				   {"o":"quality","n":"Quality","a":"Quality. 0 .. 100","l":"0-100"}, 
				   {"size":"3","maxlength":"3","value":"75"}
				 );
	//sns_strength
	createInputText($('#enc-options'), 
				   {"o":"sns_strength","n":"SNS","a":"Spatial Noise Shaping. 0=off, 100=maximum","l":"0-100"}, 
				   {"size":"3","maxlength":"3","value":"50"}
				 );
	//filter_strength
	createInputText($('#enc-options'), 
				   {"o":"filter_strength","n":"strength","a":"Filter Strength. range: [0 = off .. 100 = strongest]","l":"0-100"}, 
				   {"size":"3","maxlength":"3","value":"20"}
				 );
	//filter_sharpness
	createSelect($('#enc-options'), 
				   {"o":"filter_sharpness","n":"sharpness","a":"Filter-Sharpness. range: [0 = off .. 7 = least sharp]","l":""}, 
				   {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7"}
				 );
	//filter_type
	createSelect($('#enc-options'), 
				   {"o":"filter_type","n":"type","a":"filtering type: 0 = simple, 1 = strong (only used if filter_strength > 0 or autofilter > 0)","l":""}, 
				   {"0":"0","1":"1"}
				 );
	//partitions
	createSelect($('#enc-options'), 
				   {"o":"partitions","n":"partitions","a":"log2(number of token partitions) in [0..3] Default is set to 0 for easier progressive decoding.","l":""}, 
				   {"0":"0","1":"1","2":"2","3":"3"}
				 );
	//segments
	createSelect($('#enc-options'), 
				   {"o":"segments","n":"segments","a":"maximum number of segments to use, in [1..4]","l":"", "d":"4"}, 
				   {"4":"4","3":"3","2":"2","1":"1"}
				 );
	//pass
	createSelect($('#enc-options'), 
				   {"o":"pass","n":"pass","a":"number of entropy-analysis passes (in [1..10]).","l":""}, 
				   {"1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"10"}
				 );
	//show_compressed
	createSelect($('#enc-options'), 
				   {"o":"show_compressed","n":"Show Compressed","a":"if true, export the compressed picture back. In-loop filtering is not applied.","l":""}, 
				   {"0":"0","1":"1"}
				 );
	//preprocessing
	createSelect($('#enc-options'), 
				   {"o":"preprocessing","n":"preprocessing","a":"preprocessing filter (0=none, 1=segment-smooth)","l":""}, 
				   {"0":"0","1":"1"}
				 );
	//autofilter
	createSelect($('#enc-options'), 
				   {"o":"autofilter","n":"autofilter","a":"Auto adjust filter's strength [0 = off, 1 = on]","l":""}, 
				   {"0":"0","1":"1"}
				 );
	//extra_info_type
	createSelect($('#enc-options'), 
				   {"o":"extra_info_type","n":"extra_info_type","a":"print extra_info Type[0 = off, 6]","l":""}, 
				   {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6"}
				 );
	//preset
	createSelect($('#enc-options'), 
				   {"o":"preset","n":"preset","a":"Filter-Sharpness. range: [0 = off .. 7 = least sharp]","l":""}, 
				   {"0": "default", "1": "picture", "2": "photo", "3": "drawing", "4": "icon", "5": "text"}
				 );
	//partition_limit
	createInputText($('#enc-options'), 
				   {"o":"partition_limit","n":"<span style=\"color:red; font-size:12px; padding-bottom:1px; border-bottom:1px solid white;\"><strong>New: </strong></span> partition_limit","a":"range: [0 .. 100]","l":"0-100"}, 
				   {"size":"3","maxlength":"3","value":"0"}
				 );
	function checkIntVal(IVal,alternativeIVal) {
		return (!isNaN(Number(IVal))) ? Number(IVal) : alternativeIVal;
		
	}
	
	WebPEncodeAndDraw = function (qualityVal) {
		//24bit data (alpha coming soon)
		var input = encInContext.getImageData(0, 0, encInCanvas.width, encInCanvas.height);
		var w = input.width, h = input.height;
		var inputData = input.data;
		var out={output:''};
		var start = new Date();
		
		//CODE START
		var encoder = new WebPEncoder();
			
			//Config, you can set all arguments or what you need, nothing no objeect 
			var 
			config = new Object()
			config.target_size = 0;			// if non-zero, set the desired target size in bytes. Takes precedence over the 'compression' parameter.
			config.target_PSNR = 0.;		// if non-zero, specifies the minimal distortion to	try to achieve. Takes precedence over target_size.
			config.method = checkIntVal($('#enc-option-method').val(),0);					// quality/speed trade-off (0=fast, 6=slower-better)
			config.sns_strength = checkIntVal($('#enc-option-sns_strength').val(),50);		// Spatial Noise Shaping. 0=off, 100=maximum.
			config.filter_strength = checkIntVal($('#enc-option-filter_strength').val(),20); // range: [0 = off .. 100 = strongest]
			config.filter_sharpness = checkIntVal($('#enc-option-filter_sharpness').val(),0);// range: [0 = off .. 7 = least sharp]
			config.filter_type = checkIntVal($('#enc-option-filter_type').val(),0);			// filtering type: 0 = simple, 1 = strong (only used if filter_strength > 0 or autofilter > 0)
			config.partitions = checkIntVal($('#enc-option-partitions').val(),0);			// log2(number of token partitions) in [0..3] Default is set to 0 for easier progressive decoding.
			config.segments = checkIntVal($('#enc-option-segments').val(),4);				// maximum number of segments to use, in [1..4]
			config.pass = checkIntVal($('#enc-option-pass').val(),1);						// number of entropy-analysis passes (in [1..10]).
			config.show_compressed = checkIntVal($('#enc-option-show_compressed').val(),0);	// if true, export the compressed picture back. In-loop filtering is not applied.
			config.preprocessing = checkIntVal($('#enc-option-preprocessing').val(),0);		// preprocessing filter (0=none, 1=segment-smooth)
			config.autofilter = checkIntVal($('#enc-option-autofilter').val(),0);			// Auto adjust filter's strength [0 = off, 1 = on]
			config.partition_limit = checkIntVal($('#enc-option-partition_limit').val(),0);
																							//  --- description from libwebp-C-Source Code --- 
			config.extra_info_type = checkIntVal($('#enc-option-extra_info_type').val(),2);	// print extra_info
			config.preset = checkIntVal($('#enc-option-preset').val(),0); 					// 0: default, 1: picture, 2: photo, 3: drawing, 4: icon, 5: text
		
		//set Config; default config -> WebPConfig( null ) 
		encoder.WebPEncodeConfig(config); //when you set the config you must it do for every WebPEncode... new
		
		//start encoding
		var size = encoder.WebPEncodeRGBA(inputData, w, h, w*4, qualityVal, out); //w*4 desc: w = width, 3:RGB/BGR, 4:RGBA/BGRA 
		//CODE END
		
		var end = new Date();
		var bench_libwebp=(end-start);
		encSpeedResult.innerHTML='Speed result:<br />libwebpjs: finish in '+bench_libwebp+'ms - '+size+'bytes<pre>'+encoder.ReturnExtraInfo()+'</pre>';
		//alert(size);
		encSaveBtn.disabled=false;
		base64URI=btoa(out.output);
		encOutputWebPImage.src="data:image/webp;base64,"+base64URI;
		
	}
	
	ImageToCanvas = function (imgdata) {
		img.src = imgdata;
		encodeBtn.value = 'Encode';
	}
	
	finishInit = function () {
		//document.getElementById('encoderInfo').innerHTML='Press convert for converting to webp. Warning your browser can frozen some minutes!';
		encodeBtn.disabled=false;
	}
};

////------------------------------------------------------------------------

function WebPDecDemo() {
	var canvas = document.getElementById("outputDecoderCanvas"),
	context = canvas.getContext("2d"),
	outputData = null,
	output = null,
	active = null,
	img = document.createElement("img"),
	cropDecodingBtn = document.getElementById("cropDecodingBtn"),
	cropDecoding_x = document.getElementById("cropDecoding_x"),
	cropDecoding_y = document.getElementById("cropDecoding_y"),
	cropDecoding_w = document.getElementById("cropDecoding_w"),
	cropDecoding_h = document.getElementById("cropDecoding_h"),
	IncrementalDecodingBtn = document.getElementById("IncrementalDecodingBtn"),
	IncrementalDecBufferSizeBtn = document.getElementById("IncrementalDecBufferSizeBtn"),
	IncrementalDecSleepBtn = document.getElementById("IncrementalDecSleepBtn"),
	decSpeedResult = document.getElementById("decSpeedResult"),
	decSaveButtons = document.getElementById("decSaveButtons");
	
	clearCanvas = function () {
		context.clearRect(0, 0, canvas.width, canvas.height);
	};
	resizeCanvas = function () {
		canvas.width=img.width;
		canvas.height=img.height;
	}
	if (typeof FileReader !== "undefined")	
	context.fillText("Drop an *.WEBP image here and wait", 60, 80);
	else
	context.fillText("Choose on an sample image 1 - 5.webp", 56, 80);
		
	EventListener(img, "load", function () {
		clearCanvas();
		resizeCanvas();
		context.drawImage(img, 0, 0);
		finishInit();
	}, false);
	
	EventListener(canvas, "dragenter", function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	EventListener(canvas, "dragover", function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}, false);

	EventListener(canvas, "drop", function (evt) {
		var files = evt.dataTransfer.files;
		if (files.length > 0) {
			evt.preventDefault();
			evt.stopPropagation();
			var file = files[0];
			if (typeof FileReader !== "undefined") {
				var freader = new FileReader();
				freader.onload = function (evt) {
					if (WebPDecodeAndDraw(evt.target.result)) {
						finishDecoding(); 
					} else {
						//alert('This isn\'t a webp image.');
					}
				};
				freader.readAsBinaryString(file);
			} else {
				alert('Your Browser don\'t support the Filereader API');
			}
		}
			
	}, false);
	
	//activate buttons
	EventListener(cropDecodingBtn, "click", function (evt) {
		cropDecoding_x.disabled=cropDecoding_y.disabled=cropDecoding_w.disabled=cropDecoding_h.disabled=!cropDecodingBtn.checked;
	}, false);
	
	EventListener(IncrementalDecodingBtn, "click", function (evt) {
		IncrementalDecBufferSizeBtn.disabled=!IncrementalDecodingBtn.checked;
		IncrementalDecSleepBtn.disabled=!IncrementalDecodingBtn.checked;
	}, false);
	
	createSaveButtons = function () {
		if (decSaveButtons.innerHTML=='') {
			var imageOptions=new Array('PNG','png');//,'JPEG','jpeg','Bitmap','bitmap'
			
			for(var i=0; i<imageOptions.length;i +=2) {
				var saveImage = document.createElement("button");
				saveImage.innerHTML = "Save as "+imageOptions[i+1];
				EventListener(saveImage,"click", function (evt) {
					window.open(canvas.toDataURL("image/"+imageOptions[i+1]));
					evt.preventDefault();
				}, false);
				decSaveButtons.appendChild(saveImage);
			}
		}
	};
	
	finishDecoding = function () {
		createSaveButtons();
	};
	
	WebPDecodeAndDraw = function (data) {
		if (IncrementalDecodingBtn.checked) {
			WebPIDecodeAndDraw(data);
		} else {
			var start = new Date();
//			var WebPImage = { width:{value:0},height:{value:0} }
//			var decoder = new WebPDecoder();
//			var bitmap = decoder.WebPDecodeRGB(data, data.length, WebPImage.width, WebPImage.height);

			///libwebpjs 0.1.3 decoder code start ---------------------------------------------
			var WebPImage = { width:{value:0},height:{value:0} }
			var decoder = new WebPDecoder();
			
				data=convertBinaryToArray(data);//unkonvertierung in char

				//Config, you can set all arguments or what you need, nothing no objeect 
				var config = decoder.WebPDecoderConfig;
				var output_buffer = config.output;
				var bitstream = config.input;
				
				if (!decoder.WebPInitDecoderConfig(config)) {
				  alert("Library version mismatch!\n");
				  return -1;
				}

				config.options.no_fancy_upsampling = document.getElementById("no_fancy_upsamplingDecodingBtn").checked?1:0;
				config.options.bypass_filtering = document.getElementById("bypass_filteringDecodingBtn").checked?1:0;
				//config.options.use_threads = 1;
				config.options.use_cropping= cropDecodingBtn.checked?1:0;
				config.options.crop_left   = parseInt(cropDecoding_x.value);
				config.options.crop_top    = parseInt(cropDecoding_y.value);
				config.options.crop_width  = parseInt(cropDecoding_w.value);
				config.options.crop_height = parseInt(cropDecoding_h.value);
				//config.options.use_scaling = 1;//not implement
				//config.options.scaled_width  = 400;
				//config.options.scaled_height = 400;
				
				//todo: add stop_watch
				var StatusCode = decoder.VP8StatusCode;
				
				status = decoder.WebPGetFeatures(data, data.length, bitstream);
				if (status != StatusCode.VP8_STATUS_OK) {
				  alert('error');
				}
				
				var mode = decoder.WEBP_CSP_MODE;
				//output_buffer.colorspace = bitstream.has_alpha.value ? MODE_BGRA : MODE_BGR;
				//output_buffer.colorspace = bitstream.has_alpha.value ? MODE_RGBA : MODE_RGB;
				output_buffer.colorspace = mode.MODE_RGBA;

    			status = decoder.WebPDecode(data, data.length, config);
				
				ok = (status == StatusCode.VP8_STATUS_OK);
				if (!ok) {
				  alert("Decoding of %s failed.\n");
				  //fprintf(stderr, "Status: %d (%s)\n", status, kStatusMessages[status]);
				  return -1;
				}
				
				//alert("Decoded %s. Dimensions: "+output_buffer.width+" x "+output_buffer.height+""+(bitstream.has_alpha.value ? " (with alpha)" : "")+". Now saving...\n");
			var bitmap = output_buffer.u.RGBA.rgba;
			//var bitmap = decoder.WebPDecodeARGB(data, data.length, WebPImage.width, WebPImage.height);
			
			///libwebpjs 0.1.3 decoder code end ---------------------------------------------
			
			var end = new Date();
			var bench_libwebp=(end-start);
			
			if (bitmap) {
				//Draw Image
				var start = new Date();
				var biHeight=output_buffer.height; var biWidth=output_buffer.width;
				
				canvas.height=biHeight;
				canvas.width=biWidth;
				
				var context = canvas.getContext('2d');
				var output = context.createImageData(canvas.width, canvas.height);
				var outputData = output.data;
				
				for (var h=0;h<biHeight;h++) {			
					for (var w=0;w<biWidth;w++) {
						outputData[2+w*4+(biWidth*4)*h] = bitmap[2+w*4+(biWidth*4)*h];
						outputData[1+w*4+(biWidth*4)*h] = bitmap[1+w*4+(biWidth*4)*h];
						outputData[0+w*4+(biWidth*4)*h] = bitmap[0+w*4+(biWidth*4)*h];
						outputData[3+w*4+(biWidth*4)*h] = bitmap[3+w*4+(biWidth*4)*h];
		
					};			
				}
				
				context.putImageData(output, 0, 0);
				var end = new Date();
				var bench_canvas=(end-start);
				
				//decSpeedResult.innerHTML='Speed result:<br />libwebpjs: finish in '+bench_libwebp+'ms<br />Canvas: finish in '+bench_canvas+'ms';
				decSpeedResult.innerHTML='Speed result:<br />libwebpjs: finish in '+bench_libwebp+'ms';
				finishDecoding();
			}
		}
	};
	function drawBitmap(bitmap,WebPImage) {
		// (re)draw image, when size change
		if (WebPImage.biHeight.value!=WebPImage.height.value || WebPImage.biWidth.value!=WebPImage.width.value) {
			WebPImage.biHeight.value=WebPImage.height.value; WebPImage.biWidth.value=WebPImage.width.value;
			
			var biHeight=WebPImage.biHeight.value;
			var biWidth=WebPImage.biWidth.value;//alert(WebPImage.biHeight.value+' | '+WebPImage.biWidth.value);
			
			canvas.height=biHeight;
			canvas.width=biWidth;
			
			context = canvas.getContext('2d');
			output = context.createImageData(canvas.width, canvas.height);
			outputData = output.data;
		}
		if (bitmap && WebPImage.last_y.value!=WebPImage.last_y_cache.value) {
			var biHeight=WebPImage.biHeight.value;
			var biWidth=WebPImage.biWidth.value;
			
			for (var h=WebPImage.last_y_cache.value;h<WebPImage.last_y.value;h++) {
				for (var w=0;w<biWidth;w++) {
					outputData[0+w*4+(biWidth*4)*h] = bitmap[0+w*3+(biWidth*3)*h];
					outputData[1+w*4+(biWidth*4)*h] = bitmap[1+w*3+(biWidth*3)*h];
					outputData[2+w*4+(biWidth*4)*h] = bitmap[2+w*3+(biWidth*3)*h];
					outputData[3+w*4+(biWidth*4)*h] = 255;
	
				};			
			}
		context.putImageData(output, 0, 0);
		WebPImage.last_y_cache.value=WebPImage.last_y.value;
		}

	}
	
	function NextRGB(decoder,idec,WebPImage,data,data_off,block_size,new_data,biHeight,biWidth,bitmap,last_y,start,sleep) {
		active = setTimeout(function(){
		//window.clearTimeout(aktiv);
		block_size=block_size+data_off>data.length?data.length-data_off:block_size;
		// ... (get additional data)
		memcpy(new_data, 0, data, data_off, block_size);
		status = decoder.WebPIAppend(idec, new_data, block_size);//alert(status+' '+block_size+' '+data_off);
		//status = decoder.WebPIUpdate2(idec, data_off, block_size);//alert(status+' '+block_size+' '+data_off);
		bitmap = decoder.WebPIDecGetRGB(idec,WebPImage.last_y,WebPImage.width, WebPImage.height,WebPImage.stride);//alert(WebPImage.last_y.value);
		
		// (re)draw image, when size change
		drawBitmap(bitmap,WebPImage);
		
		data_off +=block_size;

		if (status == 5 && active)// 5: VP8_STATUS_SUSPENDED
			NextRGB(decoder,idec,WebPImage,data,data_off,block_size,new_data,biHeight,biWidth,bitmap,last_y,start,sleep);
		if (status == 0) {
			var end = new Date();
			var bench_IDecoding=(end-start);
			decSpeedResult.innerHTML='Speed result:<br />libwebpjs (Incremental decoding): finish in '+bench_IDecoding+'ms';
		}
		}, sleep);
	}

	WebPIDecodeAndDraw = function (data) {
		clearTimeout(active);
		if (isNaN(parseInt(IncrementalDecBufferSizeBtn.value))) return;
		if (isNaN(parseInt(IncrementalDecSleepBtn.value))) return;
		
		data=convertBinaryToArray(data);
		var WebPImage = { last_y:{value:null},last_y_cache:{value:null},width:{value:0},height:{value:0},biWidth:{value:0},biHeight:{value:0},stride:{value:0} };
		
		var has_more_data	= true;
		var block_size		= parseInt(IncrementalDecBufferSizeBtn.value);
		var data_off 		= 0, 
			new_data 		= Arr(block_size-1,0);
		var biHeight 		= 0, 
			biWidth 		= 0;
		var bitmap 			= null;
		var last_y			= null;
		var sleep			= parseInt(IncrementalDecSleepBtn.value);
		
		var decoder = 	new WebPDecoder();
		var idec 	= decoder.WebPINew('MODE_RGB');
		
		//decoder.WebPIAppendAll(idec, new_data, new_data.length);

		var start = new Date();
		NextRGB(decoder,idec,WebPImage,data,data_off,block_size,new_data,biHeight,biWidth,bitmap,last_y,start,sleep);
//		var start = new Date();
//		while (has_more_data) {
//		//function NextRGB() {
//			//window.clearTimeout(aktiv);
//			block_size=block_size+data_off>data.length?data.length-data_off:block_size;
//			// ... (get additional data)
//			memcpy(new_data, 0, data, data_off, block_size);
//			status = decoder.WebPIAppend(idec, new_data, block_size);//alert(status+' '+block_size+' '+data_off);
//			bitmap = decoder.WebPIDecGetRGB(idec,WebPImage.last_y,WebPImage.width, WebPImage.height,WebPImage.stride);//alert(WebPImage.last_y.value);
//			//alert(WebPImage.last_y.value+' '+WebPImage.last_y_cache.value);
//			
//			drawBitmap(bitmap,WebPImage);
//			
//			// (re)draw image, when size change
//			/*if (biHeight!=WebPImage.height.value || biWidth!=WebPImage.width.value) {
//				var biHeight=WebPImage.height.value; var biWidth=WebPImage.width.value;
//				
//				canvas.height=biHeight;
//				canvas.width=biWidth;
//				
//				context = canvas.getContext('2d');
//				output = context.createImageData(canvas.width, canvas.height);
//				outputData = output.data;
//			
//			}
//			if (bitmap && WebPImage.last_y.value!=last_y) {
//				for (var h=last_y;h<WebPImage.last_y.value;h++) {
//					for (var w=0;w<biWidth;w++) {
//						outputData[0+w*4+(biWidth*4)*h] = bitmap[0+w*3+(biWidth*3)*h];
//						outputData[1+w*4+(biWidth*4)*h] = bitmap[1+w*3+(biWidth*3)*h];
//						outputData[2+w*4+(biWidth*4)*h] = bitmap[2+w*3+(biWidth*3)*h];
//						outputData[3+w*4+(biWidth*4)*h] = 255;
//		
//					};			
//				}
//			context.putImageData(output, 0, 0);
//			last_y=WebPImage.last_y.value;
//			}*/
//
//			if (status != 5)// 5: VP8_STATUS_SUSPENDED
//			break;
//			data_off +=block_size;
//			//if (status == 5)
//			//setTimeout(function(){NextRGB()}", 2000);
//		}
		
		decoder.WebPIDelete(idec);

//		var end = new Date();
//		var bench_IDecoding=(end-start);
		
//		decSpeedResult.innerHTML='Speed result:<br />libwebp (Incremental decoding): finish in '+bench_IDecoding+'ms';
		finishDecoding();
	};
	WebPIDecodeAndDraw2 = function (data) {
		var WebPImage = { last_y:{value:0},width:{value:0},height:{value:0},stride:{value:0} }
		
		var has_more_data	= true;
		var block_size		= 256*8;
		//var data_off 		= 0; 
		var	new_data 		= Arr(block_size-1,0),
			new_data_ptr	= 0;
		var biHeight 		= 0, 
			biWidth 		= 0;
		var bitmap 			= null;
		var last_y			= null;
		
		var decoder = 	new WebPDecoder();
		var idec 	= decoder.WebPINew('MODE_RGB');
		
		var start = new Date();
		new_data=convertBinaryToArray(data);
		new_data_ptr=0;
		var end = new Date();
		var bench_bin2arr=(end-start);
		
		var start = new Date();
		while (has_more_data) {
			//block_size=block_size+data_off>data.length?data.length-data_off:block_size;
			block_size=block_size+new_data_ptr>new_data.length?new_data.length-new_data_ptr:block_size;
			// ... (get additional data)
			//memcpy(new_data, 0, data, data_off, block_size);
			status = decoder.WebPIAppend(idec, new_data, new_data_ptr, block_size);//alert(status+' '+block_size+' '+data_off);
			bitmap = decoder.WebPIDecGetRGB(idec,WebPImage.last_y,WebPImage.width, WebPImage.height,WebPImage.stride);//alert(WebPImage.last_y.value);
			
			// (re)draw image, when size change
			if (biHeight!=WebPImage.height.value || biWidth!=WebPImage.width.value) {
				var biHeight=WebPImage.height.value; var biWidth=WebPImage.width.value;
				
				canvas.height=biHeight;
				canvas.width=biWidth;
				
				context = canvas.getContext('2d');
				output = context.createImageData(canvas.width, canvas.height);
				outputData = output.data;
			
			}
			if (bitmap && WebPImage.last_y.value!=last_y) {
				for (var h=last_y;h<WebPImage.last_y.value;h++) {
					for (var w=0;w<biWidth;w++) {
						outputData[0+w*4+(biWidth*4)*h] = bitmap[0+w*3+(biWidth*3)*h];
						outputData[1+w*4+(biWidth*4)*h] = bitmap[1+w*3+(biWidth*3)*h];
						outputData[2+w*4+(biWidth*4)*h] = bitmap[2+w*3+(biWidth*3)*h];
						outputData[3+w*4+(biWidth*4)*h] = 255;
		
					};			
				}
			context.putImageData(output, 0, 0);
			last_y=WebPImage.last_y.value;
			}

			if (status != 5)// 5: VP8_STATUS_SUSPENDED
			break;
			new_data_ptr +=block_size;
		}
		
		decoder.WebPIDelete(idec);

		var end = new Date();
		var bench_IDecoding=(end-start);
		
		//decSpeedResult.innerHTML='Speed result:<br />libwebp (Incremental decoding): finish in '+bench_IDecoding+'ms<br />Convert Binary: finish in '+bench_bin2arr+'ms';
		decSpeedResult.innerHTML='Speed result:<br />libwebpjs (Incremental decoding): finish in '+bench_IDecoding+'ms';
		finishDecoding();
	};
};
