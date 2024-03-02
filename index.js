class Tetrimino {
    constructor(nombre = random(["Z", "S", "J", "L", "T", "O", "I"])) {
      this.nombre = nombre;
      let base = tetriminosBase[nombre];
      this.color = base.color;
      this.mapa = [];
      for (const pmino of base.mapa) {
        this.mapa.push(pmino.copy());
      }
      this.posición = createVector(int(tablero.columnas / 2), -1);
    }
  
    moverDerecha() {
      this.posición.x++;
      if (this.movimientoErroneo) {
        this.moverIzquierda();
      }
    }
  
    moverIzquierda() {
      this.posición.x--;
      if (this.movimientoErroneo) {
        this.moverDerecha();
      }
    }
  
    moverAbajo() {
      this.posición.y++;
      if (this.movimientoErroneo) {
        this.moverArriba();
        if (tetrimino == this) {
          tablero.almacenarMino = this;
          tetrimino = new Tetrimino();
        }
        return false
      }
      return true
    }
  
    moverArriba() {
      this.posición.y--;
    }
  
    ponerEnElFondo(){
      this.posición = this.espectro.posición
      this.moverAbajo()
    }
  
    girar() {
      for (const pmino of this.mapa) {
        pmino.set(pmino.y, -pmino.x);
      }
      if (this.movimientoErroneo) {
        this.desgirar();
      }
    }
  
    desgirar() {
      for (const pmino of this.mapa) {
        pmino.set(-pmino.y, pmino.x);
      }
    }
  
    get movimientoErroneo() {
      let salióDelTablero = !this.estáDentroDelTablero;
      return salióDelTablero || this.colisiónConMinosAlmacenados;
    }
  
    get colisiónConMinosAlmacenados() {
      for (const pmino of this.mapaTablero) {
        if (tablero.minosAlmacenados[pmino.x][pmino.y]) {
          return true;
        }
      }
      return false;
    }
  
    get estáDentroDelTablero() {
      for (const pmino of this.mapaTablero) {
        if (pmino.x < 0) {
          //Evita salida por izquierda
          return false;
        }
        if (pmino.x >= tablero.columnas) {
          //Evita salida por derecha
          return false;
        }
        if (pmino.y >= tablero.filas) {
          //Evita salida por abajo
          return false;
        }
      }
      return true;
    }
  
    get mapaTablero() {
      let retorno = [];
      for (const pmino of this.mapa) {
        let copy = pmino.copy().add(this.posición);
        retorno.push(copy);
      }
      return retorno;
    }
  
    get mapaCanvas() {
      let retorno = [];
      for (const pmino of this.mapa) {
        let copy = pmino.copy().add(this.posición);
        retorno.push(tablero.coordenada(copy.x, copy.y));
      }
      return retorno;
    }
  
    /* 
       Esta función se encargará del procesamiento lógico del dibujado de
       este objeto
       */
    dibujar() {
      push();
      fill(this.color);
      for (const pmino of this.mapaCanvas) {
        Tetrimino.dibujarMino(pmino);
      }
      pop();
      if (tetrimino == this) {
        this.dibujarEspectro();
      }
    }
  
    dibujarEspectro() {
      this.espectro = new Tetrimino(this.nombre);
      this.espectro.posición = this.posición.copy()
      for (let i = 0; i < this.mapa.length; i++) {
        this.espectro.mapa[i] = this.mapa[i].copy()
      }
      while (this.espectro.moverAbajo());
      push()
      drawingContext.globalAlpha = 0.3
      this.espectro.dibujar();
      pop()
    }
  
    static dibujarMino(pmino) {
      rect(pmino.x, pmino.y, tablero.lado_celda);
      push();
      noStroke();
      fill(255, 255, 255, 80);
      beginShape();
      vertex(pmino.x, pmino.y);
      vertex(pmino.x + tablero.lado_celda, pmino.y);
      vertex(pmino.x + tablero.lado_celda, pmino.y + tablero.lado_celda);
      endShape(CLOSE);
      beginShape();
      fill(0, 0, 0, 80);
      vertex(pmino.x, pmino.y);
      vertex(pmino.x, pmino.y + tablero.lado_celda);
      vertex(pmino.x + tablero.lado_celda, pmino.y + tablero.lado_celda);
      endShape(CLOSE);
      pop();
    }
  }
  
  function crearMapeoBaseTetriminos() {
    //Muy importante, no le pondan let, var, ni const de prefijo
    tetriminosBase = {
      Z: {
        color: "red",
        mapa: [
          createVector(),
          createVector(-1, -1),
          createVector(0, -1),
          createVector(1, 0),
        ],
      },
      S: {
        color: "pink",
        mapa: [
          createVector(),
          createVector(1, -1),
          createVector(0, -1),
          createVector(-1, 0),
        ],
      },
      J: {
        color: "orange",
        mapa: [
          createVector(),
          createVector(-1, 0),
          createVector(-1, -1),
          createVector(1, 0),
        ],
      },
      L: {
        color: "blue",
        mapa: [
          createVector(),
          createVector(-1, 0),
          createVector(1, -1),
          createVector(1, 0),
        ],
      },
      T: {
        color: "magenta",
        mapa: [
          createVector(),
          createVector(-1, 0),
          createVector(1, 0),
          createVector(0, -1),
        ],
      },
      O: {
        color: "yellow",
        mapa: [
          createVector(),
          createVector(0, -1),
          createVector(1, -1),
          createVector(1, 0),
        ],
      },
      I: {
        color: "violet",
        mapa: [
          createVector(),
          createVector(-1, 0),
          createVector(1, 0),
          createVector(2, 0),
        ],
      },
    };
  }


  const MARGEN_TABLERO = 10
  let regulador_velocidad_teclas = 0 
  let regulador_de_caida = 0
  let lineas_hechas = 0

  /* 
  Generación de fondo dinámico
  */
  let angulo_fondo = Math.random() * 360
  let tono_fondo = Math.random() * 360
  setInterval(() => {
      document.body.style.background = `linear-gradient(
          ${angulo_fondo}deg, 
          hsl(${tono_fondo},100%,50%),
          hsl(${tono_fondo},100%,0%)
      )`
      angulo_fondo += Math.random()
      tono_fondo += Math.random()
  }, 20);

  /* 
  Dificultad, hacer caer las piezas cada determinada cantidad de tiempo,
  simulando una especie de gravedad, esto se hace fácilmente con un setInterval
  */
  setInterval(() => {
      if (millis() - regulador_de_caida < 300) {
          return
      }
      regulador_de_caida = millis()
      tetrimino.moverAbajo()
  }, 500);


  /* 
  La función setup es nativa de p5.js

  y sirve para ajustar las propiedades iniciales de nuestros objetos 
  y variables
  */
  function setup() {
      createCanvas(900, 600) //crea un canvas
      /* 
      VARIABLES GLOBALES

      es importante que no le pongan let, ni var, ni const a las siguientes 
      variables. Para que puedan ser identificadas como globales
      */
      tablero = new Tablero()
      crearMapeoBaseTetriminos()
      tetrimino = new Tetrimino()
      resizeCanvas(
          tablero.ancho + 2 * MARGEN_TABLERO,
          tablero.alto + 2 * MARGEN_TABLERO + 2*tablero.lado_celda
      )
  }

  /* 
  La función draw es nativa de p5.js

  y sirve para dar instrucciones precisas de dibujo sobre el canvas
  */
  function draw() {
      clear()
      dibuajarPuntaje()
      tablero.dibujar()
      tetrimino.dibujar()
      keyEventsTetris()
  }

  function dibuajarPuntaje() {
      push()
      textSize(20)
      strokeWeight(2)
      stroke("black")
      fill("white")
      text(
          "Líneas: " + lineas_hechas,
          tablero.posición.x,
          tablero.posición.y - tablero.lado_celda / 2
      )
      pop()
  }

  let límite_regulador_velocidad_teclas = 100

  function keyEventsTetris() {
      if (millis() - regulador_velocidad_teclas < límite_regulador_velocidad_teclas) {
          return
      }
      límite_regulador_velocidad_teclas = 100
      regulador_velocidad_teclas = millis()

      if (keyIsDown(RIGHT_ARROW)) {
          tetrimino.moverDerecha()
          regulador_de_caida = millis()
      }
      if (keyIsDown(LEFT_ARROW)) {
          tetrimino.moverIzquierda()
          regulador_de_caida = millis()
      }
      if (keyIsDown(DOWN_ARROW)) {
          tetrimino.moverAbajo()
          regulador_de_caida = millis()
      }
      if (keyIsDown(UP_ARROW)) {
          límite_regulador_velocidad_teclas = 150
          tetrimino.girar()
          regulador_de_caida = millis()
      }
      if (keyIsDown(32)) {
          límite_regulador_velocidad_teclas = 200
          tetrimino.ponerEnElFondo()
          regulador_de_caida = millis()
      }}

      Swal.fire({
        title:"¡SE JUEGA SOLO EN LA COMPUTADORA!",
        text: "Moviendo con el teclado Derecha o Izquierda",
        imageUrl:"images (3).jfif",
        imageWidth: 400,
        imageHeight: 200,
        position:"center",
        background: "black",
    timer:"3000",
        confirmButtonColor:"red",
        footer:" 🕹️ A JUGAR SE HA DICHO 🕹️"
      
      }); 