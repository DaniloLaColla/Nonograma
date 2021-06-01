import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';

class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      rowClues: null,
      colClues: null,
      modo: '#',
      waiting: false,
      satisfaceF: true,
      satisfaceC: true,
      filaSatisface : [],
      columnaSatisface: [],
    };
    this.handleClick = this.handleClick.bind(this);
    this.handlePengineCreate = this.handlePengineCreate.bind(this);
    this.pengine = new PengineClient(this.handlePengineCreate);
  }

  handlePengineCreate() {
    const queryS = 'init(PistasFilas, PistasColumns, Grilla)';
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        this.setState({
          grid: response['Grilla'],
          rowClues: response['PistasFilas'],
          colClues: response['PistasColumns'],
          filaSatisface : Array(response['PistasFilas'].length).fill(false),
          columnaSatisface : Array(response['PistasColumns'].length).fill(false),
        });
      }
    });
  }

  handleClick(i, j) {
    // No action on click if we are waiting.
    if (this.state.waiting) {
      return;
    }
    // Build Prolog query to make the move, which will look as follows:
    // put("#",[0,1],[], [],[["X",,,,],["X",,"X",,],["X",,,,],["#","#","#",,],[,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
    const squaresS = JSON.stringify(this.state.grid).replaceAll('""', ""); // Remove quotes for variables.
    const queryS = 'put("'+this.state.modo+'", [' + i + ',' + j + '], '+JSON.stringify(this.state.rowClues)+', '+JSON.stringify(this.state.colClues)+',' + squaresS + ', GrillaRes, FilaSat, ColSat)';
    console.log(queryS);

    this.setState({
      waiting: true
    });
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        let nuevaGrilla = response['GrillaRes']; 
        let colSat = response['ColSat']; 
        let filaSat = response['FilaSat'];
        console.log("FilaSat es: "+response['FilaSat']);
        console.log("ColSat es: "+response['ColSat']);

        this.setState({
          grid: nuevaGrilla,
          satisfaceF: filaSat,
          satisfaceC: colSat,
        });
        this.filaValida(i, filaSat === 1);
        this.columnaValida(j, colSat === 1);
      } else {
        this.setState({
          waiting: false
        });
      }
    });
  }

  filaValida(index, cumple){
    let filaSatisface= [...this.state.filaSatisface];
    filaSatisface[index]=cumple;
    this.setState({filaSatisface,waiting:false});
  }

  columnaValida(index, cumple){
    let columnaSatisface = [...this.state.columnaSatisface]; 
    columnaSatisface[index] = cumple;
    this.setState({columnaSatisface, waiting: false});
  }

  render() {
    if (this.state.grid === null) {
      return null;
    }
    const statusText = 'Keep playing!';
    return (
      <div className = "game">
        <Board
          grid = {this.state.grid}
          rowClues = {this.state.rowClues}
          colClues = {this.state.colClues}
          onClick = {(i, j) => this.handleClick(i,j)}
          filaSatisface = {this.state.filaSatisface}
          columnaSatisface = {this.state.columnaSatisface}
        />
        <div className = "gameInfo">
          {statusText}
        </div>
      </div>
    );
  }
}

export default Game;