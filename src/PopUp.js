import React from 'react';
//import logo from './logo.svg';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';

class PopUp extends React.Component{
  state={
    abierto: false,
  }

  abrirModal(){
    this.setState({abierto: !this.state.abierto});
  }
  
  
  cerrarModal=()=>{
    this.setState({abierto: this.state.abierto});
  }

  render(){

    const modalStyles={
      position: "absolute",
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
    return(
      <Modal isOpen={this.state.abierto} style={modalStyles}>
        <ModalHeader>
          ¡GANASTE!
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Button color="success" onClick={this.cerrarModal}>Volver</Button>
          </FormGroup>
        </ModalBody>

        <ModalFooter>
            Gracias por jugar.
        </ModalFooter>
      </Modal>
    )
  }
}

export default PopUp;