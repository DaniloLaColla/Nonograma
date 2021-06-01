import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import SwitchButton from './SwitchButton'

class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      rowClues: null,
      colClues: null,
      mode: '#',
      SwitchButton: true,
      lista_filas_que_cumplen_al_iniciar: null,
      lista_columnas_que_cumplen_al_iniciar: null,
      estadoNonograma: 'Estado del nonograma: sin resolver',
      arreglo_verificar_fila: [],
      arreglo_verificar_columna: [],
      nonogramaResuelto: false,
      waiting: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.handlePengineCreate = this.handlePengineCreate.bind(this);
    this.pengine = new PengineClient(this.handlePengineCreate);
  }

  cambiarModo() {
    var nuevoModo = 'X';
    if (this.state.mode === 'X'){
        nuevoModo = "#";}
        this.setState({
          mode: nuevoModo,
        });
    
  }

  handlePengineCreate() {
    const queryS = 'init(PistasFilas, PistasColumns, Grilla)';
    
    this.pengine.query(queryS, (success, response) => {
      if (success) {
      
        this.setState({
          grid: response['Grilla'],
          rowClues: response['PistasFilas'],
          colClues: response['PistasColumns'],  
          arreglo_verificar_fila: Array(response['PistasFilas'].length).fill(false),
          arreglo_verificar_columna: Array(response['PistasColumns'].length).fill(false),
        });

                                       
        const grilla = JSON.stringify(this.state.grid).replaceAll('""', "");
        const pistasFilas = JSON.stringify(this.state.rowClues).replaceAll('""', "_");
        const pistasColumnas = JSON.stringify(this.state.colClues).replaceAll('""', "_");

        const verificar_al_iniciar = 'verificacion_al_comenzar(' + grilla + ', '+
        pistasFilas +', '+ pistasColumnas + ', ListaFilasQueCumplen, ListaColumnasQueCumplen)';
    
        this.pengine.query(verificar_al_iniciar, (success, response) => {
          if (success) {

            this.setState({
               lista_filas_que_cumplen_al_iniciar: response['ListaFilasQueCumplen'],
               lista_columnas_que_cumplen_al_iniciar: response['ListaColumnasQueCumplen'],
            });

            this.verificar_columna_al_comenzar(this.state.lista_columnas_que_cumplen_al_iniciar.length);
            this.verificar_fila_al_comenzar(this.state.lista_filas_que_cumplen_al_iniciar.length);
            this.verificar_solucion();

          } 
        });  
      }
    });
  }

  verificar_fila_al_comenzar(longitud) {
    for (let i = 0; i < longitud; i++)
          this.validar_fila(this.state.lista_filas_que_cumplen_al_iniciar[i], true);
  }

  verificar_columna_al_comenzar(longitud) {
    for (let i = 0; i < longitud; i++)
          this.validar_columna(this.state.lista_columnas_que_cumplen_al_iniciar[i], true);
  }

  handleClick(i, j) {
    // No action on click if we are waiting.
    if (this.state.waiting || this.state.nonogramaResuelto) {
      return;
    }
    
    // Build Prolog query to make the move, which will look as follows:
    // put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
    
    const pistas_filas = JSON.stringify(this.state.rowClues).replaceAll('""', "_");
    const pistas_col = JSON.stringify(this.state.colClues).replaceAll('""', "_");
    const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); 
    const queryS = 'put("'+this.state.mode+'", [' + i + ',' + j + '], '+ pistas_filas + 
    ' , '+ pistas_col +' , ' + squaresS + ', GrillaRes, FilaSat, ColSat)';
    
    
    this.setState({
      waiting: true
    });

    this.pengine.query(queryS, (success, response) => {
      if (success) {

        let nuevaGrilla = response['GrillaRes']; 
        let colSat = response['ColSat']; 
        let filaSat = response['FilaSat'];

        this.setState({
          grid: nuevaGrilla,
        });

        this.validar_fila(i, filaSat === 1);
        this.validar_columna(j, colSat === 1);
        this.verificar_solucion();
        
      } else {
        this.setState({
          waiting: false
        });
      }
    });
  }

  validar_fila(indice, cumple) {
    let arreglo_verificar_fila = [...this.state.arreglo_verificar_fila];
    arreglo_verificar_fila[indice] = cumple;
    this.setState({arreglo_verificar_fila, waiting: false});
  }

  validar_columna(indice, cumple) { 
    let arreglo_verificar_columna = [...this.state.arreglo_verificar_columna]; 
    arreglo_verificar_columna[indice] = cumple;
    this.setState({arreglo_verificar_columna, waiting: false});
  }

  verificar_solucion() {

    let satisface_fila = true;
    let satisface_columna = true;
    
    const longitud_fila = this.state.arreglo_verificar_fila.length;
    const longitud_columna = this.state.arreglo_verificar_columna.length;

    for (let i = 0; i < longitud_fila && satisface_fila; i++)
      if (this.state.arreglo_verificar_fila[i] === false)
          satisface_fila = false;

    for (let i = 0; i < longitud_columna && satisface_fila; i++)
      if (this.state.arreglo_verificar_columna[i] === false)
          satisface_columna = false;      


    if (satisface_fila && satisface_columna) {
      this.setState({
        estadoNonograma: 'Estado del nonograma: resuelto',
        nonogramaResuelto: true
      })
    }
  }  

  render() {
    if (this.state.grid === null) {
      return null;
    }

    return (
      
      <div className="game">
         <Board

            grid = {this.state.grid}
            rowClues = {this.state.rowClues}
            colClues = {this.state.colClues}
            onClick = {(i, j) => this.handleClick(i,j)}
            arreglo_verificar_fila = {this.state.arreglo_verificar_fila}
            arreglo_verificar_columna = {this.state.arreglo_verificar_columna}

        />   
          <div className = "gameInfo">
            {""}
          </div>
          <div> 
            <SwitchButton 
                changeMode = {() => this.cambiarModo()} /> 
                {this.state.estadoNonograma}
                
          </div>
          
      </div>
    );
  }
}

export default Game;
