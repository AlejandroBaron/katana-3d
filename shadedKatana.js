"use strict";

/*
Práctica 3 de Alejandro Barón para la asignatura Programación de Aplicaciones Gráficas. 
Katana que permite jugar con texturas e iluminación
Basado en los materiales proporcionados por Margarita (profesora de la asignatura) y en el shadedCube de EdAngel
*/
var canvas;
var gl;
var ruta_texturas="https://cdn.jsdelivr.net/gh/AlejandroBaron/katana-3d@master/texturas.png";

//Numero de vertices de cada parte (3 son conteos que se incrementan al montar el modelo, útil en debugging si solo renderizaba una parte)
var numVertices  = 36;
var nVertMango=0;
var nVertHoja=0;
var nVertCazoleta=0;


//Coordenadas de cada material en texturas.png
var coordTextMadera=[0/4,1/4]
var coordTextOxido=[1/4,2/4]
var coordTextAcero=[2/4,3/4]
var coordTextLana=[3/4,4/4]



//Coordenadas en la textura de cada parte (mapeos para la hoja, mapeos para la cazoleta y el mango distintos, así puedo cambiar el material)
var coordTextHojInf=coordTextAcero[0]
var coordTextHojSup=coordTextAcero[1]
var coordTextCazInf=coordTextMadera[0]
var coordTextCazSup=coordTextMadera[1]
var coordTextMangInf=coordTextLana[0]
var coordTextMangSup=coordTextLana[1]


//Arrays que almacenarán los vértices del modelo y las normales respectivamente
var pointsArray = [];
var normalsArray = [];


//Arrays que guardarán los productos de la normal con la luz en cada componente de phong
var ambientProductArray=[];
var diffuseProductArray=[];
var specularProductArray=[];


//Array de mapeo de texturas
var mapeo=[];

//Variables de cámara para rotar
let posRatonX = null;
let posRatonY = null;
let ratonAbajo = false;

//Array que guarda los valores asociados al comportamiento de la luz de cada material para cada vértice
var materialAmbientArray=[];
var materialDiffuseArray=[];
var materialSpecularArray=[];
var materialShininessArray=[];


//Vértices para construir el  hoja
var h=[]
h.push(     [0,0,0],//para que empiece en 1 el array

            //Cara A
            [-0.85,-0.825+0.3,0.0,1.0], //1
            [-0.775,-0.8+0.3,0.0,1.0], //2
            [-0.7,-0.87+0.3,0.0,1.0], //3
            [-0.7,-0.81+0.3,0.025,1.0], //4
            [0.25,-0.39+0.3,0.0,1.0],//5--11
            [0.3,-0.42+0.3,0.025,1.0],//6--12
            [0.3,-0.455+0.3,0.0,1.0],//7--13

            //Cara B
            [-0.85,-0.825+0.3,0.0,1.0], //1
            [-0.775,-0.8+0.3,0.0,1.0], //2
            [-0.7,-0.87+0.3,0.0,1.0], //3
            [-0.7,-0.81+0.3,-0.025,1.0], //4
            [0.25,-0.39+0.3,0.0,1.0],//5--11
            [0.3,-0.42+0.3,-0.025,1.0],//6--12
            [0.3,-0.455+0.3,0.0,1.0],//7--13

            )

//Vértices para construir  la cazoleta
var c=[]
c.push(   [0,0,0]  ,
            [0.175,-0.3+0.3,-0.1,1.0], //a
            [0.175,-0.3+0.3,0.1,1.0], //b
            [0.305,-0.55+0.3,0.1,1.0],//c
            [0.305,-0.55+0.3,-0.1,1.0],//d
            [0.225,-0.275+0.3,0.1,1.0], //e
            [0.225,-0.275+0.3,-0.1,1.0],//f
            [0.35,-0.525+0.3,0.1,1.0],//g
            [0.35,-0.525+0.3,-0.1,1.0],//h
)

//Vértices para construir el mango
var m=[]
m.push(   [0,0,0]  ,
            [0.25,-0.38+0.3,0.035,1.0],//1 
            [0.25,-0.38+0.3,-0.035,1.0], //2
            [0.45,-0.3+0.3,0.035,1.0], //3
            [0.45,-0.3+0.3,-0.035,1.0], //4
            [0.5,-0.35+0.3,0.035,1.0],//5
            [0.5,-0.35+0.3,-0.035,1.0],//6
            [0.3,-0.44+0.3,-0.035,1.0],//7 
            [0.3,-0.44+0.3,0.035,1.0],//8 

)


//Valores del shininess de cada material
var shininessMetal=1;
var shininessOxido=1.5;
var shininessMadera=1000.0;
var shininessLana=2000.0;


//Valores iniciales de la luz, blanca con una intensidad del 60% (en verdad sería gris)
var intensidad_incial=0.6
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(1.0*intensidad_incial, 1.0*intensidad_incial, 1.0*intensidad_incial, 1.0 );
var lightDiffuse = vec4( 1.0*intensidad_incial, 1.0*intensidad_incial, 1.0*intensidad_incial, 1.0 );
var lightSpecular = vec4(1.0*intensidad_incial, 1.0*intensidad_incial, 1.0*intensidad_incial, 1.0 );


//Valores de la respuesta a la luz de cada parte iniciales (empiezan con metal,madera y lana inicialmente)
var hojaAmbient = vec4( 0.5, 0.5, 0.5, 1.0 );
var hojaDiffuse = vec4( 0.6, 0.6, 0.6, 1.0);
var hojaSpecular = vec4( 0.8, 0.8,0.8, 1.0 );
var hojaShininess = shininessMetal;

var cazoletaAmbient = vec4( 1.0, 1.0, 0.0, 1.0 );
var cazoletaDiffuse = vec4(  1.0,1.0,0.0, 1.0);
var cazoletaSpecular = vec4( 0.3, 0.3,0.3, 0 );
var cazoletaShininess = shininessMadera;

var mangoAmbient = vec4( 0.2,0.2,0.2, 1.0 );
var mangoDiffuse = vec4( 0.2,0.2,0.2, 1.0);
var mangoSpecular = vec4( 0.2, 0.2,0.2, 0 );
var mangoShininess = shininessLana;



//Matrices de vista y proyección
var modelView, projection;
var program;

//Constantes para los ejes
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;

//Angulo de rotación
var theta =[0, 0, 0];


//Funcion ampliada respecto a la de Ed.Angel.

//A parte de los triangulos abc y acd y sus normales, calculo directamente los productos con la luz segun el material.
//Vertices indica la parte a usar (vertices de la hoja, de la cazoleta o del mango)
//Parte la parte a la que corresponden los vertices para setear los colores de cada vertice
function quad(a, b, c, d,vertices,parte) {

     var colorAmbiente=""
     var colorDifusa=""
     var colorEspec=""
     var colorBrillo=""
     if (parte=="hoja"){

        colorAmbiente=hojaAmbient
        colorDifusa=hojaDiffuse
        colorEspec=hojaSpecular
        colorBrillo=hojaShininess
        nVertHoja+=6
     }
     if (parte=="cazoleta"){

         colorAmbiente=cazoletaAmbient
         colorDifusa=cazoletaDiffuse
         colorEspec=cazoletaSpecular
         colorBrillo=cazoletaShininess
         nVertCazoleta+=6
     }
     if (parte=="mango"){

         colorAmbiente=mangoAmbient
         colorDifusa=mangoDiffuse
         colorEspec=mangoSpecular
         colorBrillo=mangoShininess
         nVertMango+=6
     }
     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);

     //Para el punto a guardo su normal, su brillo (del material indicado por el argumento parte)
     //Y el producto de la normal con el color del material
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     materialShininessArray.push(colorBrillo)
     ambientProductArray.push(mult(lightAmbient, colorAmbiente))
     diffuseProductArray.push(mult(lightDiffuse, colorDifusa))
     specularProductArray.push(mult(lightSpecular, colorEspec))



     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     materialShininessArray.push(colorBrillo)
     ambientProductArray.push(mult(lightAmbient, colorAmbiente))
     diffuseProductArray.push(mult(lightDiffuse, colorDifusa))
     specularProductArray.push(mult(lightSpecular, colorEspec))

     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     materialShininessArray.push(colorBrillo)
     ambientProductArray.push(mult(lightAmbient, colorAmbiente))
     diffuseProductArray.push(mult(lightDiffuse, colorDifusa))
     specularProductArray.push(mult(lightSpecular, colorEspec))


     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     materialShininessArray.push(colorBrillo)
     ambientProductArray.push(mult(lightAmbient, colorAmbiente))
     diffuseProductArray.push(mult(lightDiffuse, colorDifusa))
     specularProductArray.push(mult(lightSpecular, colorEspec))

     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     materialShininessArray.push(colorBrillo)
     ambientProductArray.push(mult(lightAmbient, colorAmbiente))
     diffuseProductArray.push(mult(lightDiffuse, colorDifusa))
     specularProductArray.push(mult(lightSpecular, colorEspec))

     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
     materialShininessArray.push(colorBrillo)
     ambientProductArray.push(mult(lightAmbient, colorAmbiente))
     diffuseProductArray.push(mult(lightDiffuse, colorDifusa))
     specularProductArray.push(mult(lightSpecular, colorEspec))
}


//Crea el modelo segun vertices y materiales y las normales asociadas llamando a quad
function colorSword()
{
    nVertMango=0;
    nVertHoja=0;
    nVertCazoleta=0;
    quad(2,1,3,4,h, "hoja" );//punta

    quad( 6,5,2,4,h, "hoja"); //hoja

    quad( 7,6,4,3,h,  "hoja"  ); //filo

    quad( 4+7,3+7,1+7,2+7,h, "hoja"  );//punta B

    quad( 4+7,2+7,5+7,6+7,h,  "hoja" ); //hoja B

    quad( 3+7, 4+7, 6+7, 7+7,h,  "hoja" ); //filoB


    //Cazoleta
    quad(4,3,2,1,c,"cazoleta");

    quad(6,1,2,5,c,"cazoleta");


    quad(2,3,7,5,c,"cazoleta");//bien
    quad(6,8,4,1,c,"cazoleta");




    quad(8,7,3,4,c,"cazoleta");

    quad(6,5,7,8,c,"cazoleta");

    //Mango

    quad(1,8,5,3,m,"mango");
    quad(4,6,7,2,m,"mango");
    quad(4,2,1,3,m,"mango");
    quad(6,5,8,7,m,"mango");
    quad(4,3,5,6,m,"mango");
      /*
    */
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    deteccionEventos();
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    //gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorSword();
    setModelBuffers(gl);
    setTextures(gl);
    render();
}

function setModelBuffers(gl){

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

 

    projection = ortho(-1, 1, -1, 1, -100, 100);



    //Paso de valores al vertex para el cálculo de la luz y posiciones
    var ambientBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, ambientBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(ambientProductArray), gl.STATIC_DRAW );

    var vAmbientProduct = gl.getAttribLocation( program, "vAmbientProduct" );
    gl.vertexAttribPointer( vAmbientProduct, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vAmbientProduct );


    var diffuseBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, diffuseBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(diffuseProductArray), gl.STATIC_DRAW );

    var vDiffuseProduct = gl.getAttribLocation( program, "vDiffuseProduct" );
    gl.vertexAttribPointer( vDiffuseProduct, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vDiffuseProduct );

    var specularBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, specularBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(specularProductArray), gl.STATIC_DRAW );

    var vSpecularProduct = gl.getAttribLocation( program, "vSpecularProduct" );
    gl.vertexAttribPointer( vSpecularProduct, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vSpecularProduct );

   //Brillo
    var shininessBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, shininessBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(materialShininessArray), gl.STATIC_DRAW );


    var vShininess = gl.getAttribLocation( program, "vShininess" );
    gl.vertexAttribPointer( vShininess, 1, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vShininess );


    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );


    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));




}


//Funcion que setea las texturas, es la del tutorial de webgl fundamentals que nos recomendaste
function setTextures(gl){
    // Mapea los vértices
    setTexcoords(gl);

    // Crea la textura
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Llena la base de la textura con pixeles azules
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));

    // Carga asíncrona de imagen
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.src = ruta_texturas;

    image.addEventListener('load', function() {
       // Pegamos la imagen a la textura
       gl.bindTexture(gl.TEXTURE_2D, texture);
       gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
       //gl.generateMipmap(gl.TEXTURE_2D);


       });


}

//Mapea cada vértice con el material que le toque (gracias a que guardo 
//la coordenada de la textura asociada a cada parte, solo es replicar tantas veces como vertices tenga esa parte)
function setTexcoords(gl) {
   var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

   var buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.enableVertexAttribArray(texcoordLocation);

   // We'll supply texcoords as floats.
   gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

   var i=0;
   mapeo=[];
   for(i=0;i<nVertHoja/6;i++){
      mapeo.push(coordTextHojInf,0)
      mapeo.push(coordTextHojInf,1)
      mapeo.push(coordTextHojSup,0)

      mapeo.push(coordTextHojSup,1)
      mapeo.push(coordTextHojInf,1)
      mapeo.push(coordTextHojSup,0)

   }
   for(i=nVertHoja/6;i<(nVertHoja+nVertCazoleta)/6;i++){
      mapeo.push(coordTextCazInf,0)
      mapeo.push(coordTextCazInf,1)
      mapeo.push(coordTextCazSup,0)

      mapeo.push(coordTextCazSup,1)
      mapeo.push(coordTextCazInf,1)
      mapeo.push(coordTextCazSup,0)

   }
   for(i=(nVertHoja+nVertCazoleta)/6;i<(nVertHoja+nVertCazoleta+nVertMango)/6;i++){
      mapeo.push(coordTextMangInf,0)
      mapeo.push(coordTextMangInf,1)
      mapeo.push(coordTextMangSup,0)

      mapeo.push(coordTextMangSup,1)
      mapeo.push(coordTextMangInf,1)
      mapeo.push(coordTextMangSup,0)

   }
   gl.bufferData(
       gl.ARRAY_BUFFER,
       new Float32Array(mapeo),
        gl.DYNAMIC_DRAW);
}


//Funcion de render que ademas multiplica la modelView por el angulo dictado por el movimiento del raton
var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //if(flag) theta[axis] += 1.5;

    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));

    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );

    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length);

    setModelBuffers(gl);
    requestAnimFrame(render);
}







//Funcion que lee de los selectors el material de cada parte y actualiza los parámetros
function updateMaterial(parte){

      //Utilidades para hacer el código más cómodo, guardan los materiales y los valores de los parámetros en un diccionario
      var mats={"Steel":coordTextAcero,"Wood":coordTextMadera,"Wool":coordTextLana,"Rust":coordTextOxido}
      var mats_shine={"Steel":shininessMetal,"Wood":shininessMadera,"Wool":shininessLana,"Rust":shininessOxido}

      if(parte=="hoja"){

         var drop=document.getElementById("selectHoja")
         var coordMat=mats[drop.options[drop.selectedIndex].value];
         console.log("actualizo a",coordMat)
         coordTextHojInf=coordMat[0];
         coordTextHojSup=coordMat[1];
         hojaShininess=mats_shine[drop.options[drop.selectedIndex].value];
      }
      if(parte=="cazoleta"){

         var drop=document.getElementById("selectCazoleta")
         var coordMat=mats[drop.options[drop.selectedIndex].value];
         console.log("actualizo a",coordMat)
         coordTextCazInf=coordMat[0];
         coordTextCazSup=coordMat[1];
         cazoletaShininess=mats_shine[drop.options[drop.selectedIndex].value];
      }
      if(parte=="mango"){

         var drop=document.getElementById("selectMango")
         var coordMat=mats[drop.options[drop.selectedIndex].value];
         console.log("actualizo a",coordMat)
         coordTextMangInf=coordMat[0];
         coordTextMangSup=coordMat[1];
         mangoShininess=mats_shine[drop.options[drop.selectedIndex].value];
      }

      setTextures(gl);
}


//Función de cambio de colores
function changeColor(parte){

      var mats={"Steel":coordTextAcero,"Wood":coordTextMadera,"Wool":coordTextLana,"Rust":coordTextOxido}

      if(parte=="hoja"){

         var r=document.getElementById("sliderRHoja").value/255
         var g=document.getElementById("sliderGHoja").value/255
         var b=document.getElementById("sliderBHoja").value/255

         console.log(r,g,b);
         hojaAmbient = vec4( r, g, b, 1.0 );
         hojaDiffuse = vec4( r, g, b, 1.0);
         hojaSpecular = vec4( r, g,b, 1.0 );


      }
      if(parte=="cazoleta"){

        var r=document.getElementById("sliderRCazoleta").value/255
        var g=document.getElementById("sliderGCazoleta").value/255
        var b=document.getElementById("sliderBCazoleta").value/255

        console.log(r,g,b);
        cazoletaAmbient = vec4( r, g, b, 1.0 );
        cazoletaDiffuse = vec4( r, g, b, 1.0 );
        cazoletaSpecular = vec4( r, g, b, 1.0 );


      }
      if(parte=="mango"){
        var r=document.getElementById("sliderRMango").value/255
        var g=document.getElementById("sliderGMango").value/255
        var b=document.getElementById("sliderBMango").value/255

        console.log(r,g,b);
        mangoAmbient = vec4( r, g, b, 1.0 );
        mangoDiffuse = vec4( r, g, b, 1.0 );
        mangoSpecular = vec4( r, g, b, 1.0 );

      }
      clearArrays();
      colorSword();
      setModelBuffers(gl);
      setTextures(gl);
}

//Igual que antes pero para la luz
   function changeColorLuz(componente){
     if(componente="difusa"){
       var r=document.getElementById("sliderRDif").value/255
       var g=document.getElementById("sliderGDif").value/255
       var b=document.getElementById("sliderBDif").value/255
       var int=document.getElementById("sliderIntDif").value/100

       lightDiffuse = vec4( r*int, g*int, b*int, 1.0 );


     }

     if(componente="ambiente"){
         var r=document.getElementById("sliderRAmb").value/255
         var g=document.getElementById("sliderGAmb").value/255
         var b=document.getElementById("sliderBAmb").value/255
         var int=document.getElementById("sliderIntAmb").value/100
         lightAmbient = vec4( r*int, g*int, b*int, 1.0 );

     }

     if(componente="especular"){
       var r=document.getElementById("sliderREspec").value/255
       var g=document.getElementById("sliderGEspec").value/255
       var b=document.getElementById("sliderBEspec").value/255
       var int=document.getElementById("sliderIntEspec").value/100

       lightSpecular = vec4( r*int, g*int, b*int, 1.0 );


     }
     clearArrays();
     colorSword();
     setModelBuffers(gl);
     setTextures(gl);

   }
   function updateLightPos(){
     var selx=document.getElementById("selectXLight");
     var x=selx.options[selx.selectedIndex].value;

     var sely=document.getElementById("selectYLight");
     var y=sely.options[sely.selectedIndex].value;

     var selz=document.getElementById("selectZLight");
     var z=selz.options[selz.selectedIndex].value;

     lightPosition=vec4(x,y,z,1.0);
     console.log(x,y,z);
     clearArrays();
     colorSword();
     setModelBuffers(gl);
     setTextures(gl);
   }

   //Utilidad para resetear el modelo
   function clearArrays(){
     pointsArray = [];
     normalsArray = [];

     ambientProductArray=[];
     diffuseProductArray=[];
     specularProductArray=[];

   }


   /* Deteccion de eventos*/


    function deteccionEventos(){
      	canvas.onmousedown=pulsaRatonAbajo;
      	document.onmouseup=pulsaRatonArriba;
      	document.onmousemove=mueveRaton;

      }
     /* Gestion de ventos*/

     function pulsaRatonAbajo(event) {

        ratonAbajo = true;
        posRatonX = event.clientX;
        posRatonY = event.clientY;

    }

    function pulsaRatonArriba(event) {
        ratonAbajo = false;
    }

    function mueveRaton(event) {

        if (!ratonAbajo) {
            return;
        }
        let nuevaX = event.clientX;
        let nuevaY = event.clientY;
        let deltaX = nuevaX - posRatonX;
        let deltaY = nuevaY - posRatonY;



        theta[1]+=deltaX/2;
        theta[0]+=deltaY/2;

        posRatonX = nuevaX;
        posRatonY = nuevaY;
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
