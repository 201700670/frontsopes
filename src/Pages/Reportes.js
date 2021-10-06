import React from "react";
import NavVar from "../Components/NavVar";
import DataCard from "../Components/DataCard";
import Tabla from "../Components/Tabla";
import Barras from "../Components/Barras"
import Pastel from "../Components/Pastel"
import socket from "../Recursos/Socket";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import Like from '@material-ui/icons/ThumbUpRounded';
import Cat from '@material-ui/icons/Category';
import Book from '@material-ui/icons/MenuBookRounded';

const connection = require("../Recursos/Connection")



class Reportes extends React.Component {
    constructor(props){
        super(props);
        
        this.state = {
            principalData: [],
            cakeLabels: [],
            cakeData: [],
            barLabels: [],
            barData: [],
            columnas: ['NOMBRE', 'FECHA', 'COMENTARIO', 'UPVOTES', 'DOWNVOTES', 'HASHTAGS'],
            dataTable: [],
            timeLabels: ['GO', 'PYTHON', 'RUST'],
            timeData: [],
            report: "ambos",
            cargado: false,
            db: false
        };

        this.setAmbos = this.setAmbos.bind(this);
        this.setBarras = this.setBarras.bind(this);
        this.setPastel = this.setPastel.bind(this);
        this.changeDB = this.changeDB.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this)
        this.filtrarFechaReport = this.filtrarFechaReport.bind(this)
        this.filtrarFecha = this.filtrarFecha.bind(this)
    }

    changeDB(){
        this.setState({
            principalData: [],
            cakeLabels: [],
            cakeData: [],
            barLabels: [],
            barData: [],
            columnas: ['NOMBRE', 'FECHA', 'COMENTARIO', 'UPVOTES', 'DOWNVOTES', 'HASHTAGS'],
            dataTable: [],
            cargado: false
        })  

        if(this.state.db===true) { 
            this.getMongo()   
        }
        else {
            this.getSQL()
        }
    }

    setAmbos(){
        this.setState({
            report: "ambos"
        })
    }

    setBarras(){
        this.setState({
            report: "bar"
        })
    }

    setPastel(){
        this.setState({
            report: "cake"
        })
    }

    getMongo(){
        fetch(connection.getConnection()+'/getReportsMongo'
            , {
                method: 'POST', 
                headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Methods' : 'GET, PUT, POST, DELETE',
                'Access-Control-Allow-Headers': ''
            },
            body: JSON.stringify({"fecha": "xd"}) 
            }).then(res => res.json()).then((data) => {
                let newData = data["data"]
                this.setState({
                    principalData: [newData.twits, newData.hashtags, newData.upvotes],
                    cakeLabels: newData["tophash"],
                    cakeData: newData["tophashData"],
                    barLabels: newData["days"],
                    barData: [newData["upvotesByDay"], newData["downvotesByDay"]],
                    dataTable: newData["last100entrys"],
                    timeData: newData["times"],
                    db:false,
                    cargado: true
                })    
            })
    }

    getSQL(){
        fetch(connection.getConnection()+'/getReportsMySQL'
            , {
                method: 'POST', 
                headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Methods' : 'GET, PUT, POST, DELETE',
                'Access-Control-Allow-Headers': ''
            },
            body: JSON.stringify({"fecha": "xd"}) 
            }).then(res => res.json()).then((data) => {
                let newData = data["data"]
                this.setState({
                    principalData: [newData.twits, newData.hashtags, newData.upvotes],
                    cakeLabels: newData["tophash"],
                    cakeData: newData["tophashData"],
                    barLabels: newData["days"],
                    barData: [newData["upvotesByDay"], newData["downvotesByDay"]],
                    dataTable: newData["last100entrys"],
                    timeData: newData["times"],
                    db:true,
                    cargado: true
                })    
            })   
    }

    filtrarFecha(){
        if(this.state.db===true){
            this.filtrarFechaReport('/filtrarFechaSQL')
        }else{
            this.filtrarFechaReport('/filtrarFechaMongo')
        }
    }

    filtrarFechaReport(ruta){
        let fechaInicio = document.getElementById('fechaI').value
        let fechaFinal = document.getElementById('fechaF').value
        fetch(connection.getConnection()+ruta//'/filtrarFechaSQL'
            , {
                method: 'POST', 
                headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Methods' : 'GET, PUT, POST, DELETE',
                'Access-Control-Allow-Headers': ''
            },
            body: JSON.stringify({"fechaI": fechaInicio, "fechaF": fechaFinal}) 
            }).then(res => res.json()).then((data) => {
                let newData = data["data"]
                this.setState({
                    barLabels: newData["days"],
                    barData: [newData["upvotesByDay"], newData["downvotesByDay"]]
                })    
            })   
    }

    componentDidMount(){
        if(this.state.db===false)
            this.getMongo()
        else this.getSQL()

        socket.emit('connection');   

        socket.on('AddReports', data => {            
            this.notify("Se Ha Actualizado El Reporte")
            let newData = JSON.parse(data["data"])
            this.setState({
                principalData: [newData.twits, newData.hashtags, newData.upvotes],
                cakeLabels: newData["tophash"],
                cakeData: newData["tophashData"],
                barLabels: newData["days"],
                barData: [newData["upvotesByDay"], newData["downvotesByDay"]],
                dataTable: newData["last100entrys"],
                timeData: newData["times"]
            })                       
        })

        socket.on('receiveNotifyRep', data => {
            if(this.state.db===false){
                data.db.rep="cosmo"
            }else{
                data.db.rep="sql"
            }

            let fechaInicio = document.getElementById('fechaI').value
            let fechaFinal = document.getElementById('fechaF').value

            socket.emit('getReports', {data: data, fechaI: fechaInicio, fechaF: fechaFinal})
        })
    }

    notify(mensaje){
        toast.info(mensaje, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    render() {
        let switchC =   <div style={{marginLeft: 25, marginRight:25}}>                                                                                   
                            <BootstrapSwitchButton checked={this.state.db} onstyle="outline-primary" offstyle="outline-success" onlabel='MySql' offlabel='Mongo' width={100} onChange={this.changeDB}/>
                        </div>

        if(this.state.cargado===false){
            return(
                <form>
                    <NavVar switchComp={switchC}/>
                    <div style={{textAlign: "center", marginTop: 250}}>
                        <div class="spinner-border text-light" role="status">
                            <span class="sr-only"></span>
                        </div>    
                    </div>           
                </form>
            )
        }

        let ambos = [
            <div class="row" style={{marginRight: 25, marginLeft: 75, marginTop: 25, textAlign: "center"}}>
                <div class="col-sm-6">
                    <Barras altura={230} labels={this.state.barLabels} upvotes={this.state.barData[0]} downvotes={this.state.barData[1]}/>
                </div>,
                <div class="col-sm-5" style={{left: 70}}>
                    <Pastel labels={this.state.cakeLabels} data={this.state.cakeData}/>
                </div>
            </div>
        ]

        let onlyBars = [
            <div style={{marginRight: "auto", marginLeft: 25, marginTop: 25, left: 200}}>
                <Barras altura={150} labels={this.state.barLabels} upvotes={this.state.barData[0]} downvotes={this.state.barData[1]}/>
            </div>
        ]
        let onlyCake = [
            <div style={{marginLeft: 325, textAlign: "center", width: 800, marginTop: 25}}>
                <div class="col" style={{left: 0}}>
                    <Pastel labels={this.state.cakeLabels} data={this.state.cakeData}/>
                </div>
            </div>
        ]

        var report = ambos;

        if(this.state.report == "ambos"){
            report=ambos;
        }
        if(this.state.report == "bar"){
            report=onlyBars;
        }
        if(this.state.report == "cake"){
            report=onlyCake;
        }
        
        return (
            <form>
                <NavVar switchComp={switchC}/>
                <ToastContainer
                                position="top-right"
                                autoClose={5000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                    />
                <div class="row" style={{marginRight: 25, marginLeft: 25, marginTop: 75}}>
                    <DataCard nombre="NOTICIAS" dato={this.state.principalData[0]} icon = {<Book fontSize="large"/>} />
                    <DataCard nombre="HASHTAGS" dato={this.state.principalData[1]+" DIFERENTES"} icon={<Cat fontSize="large"/>}/>
                    <DataCard nombre="UPVOTES" dato={this.state.principalData[2]} icon={<Like fontSize="large"/>}/>
                </div>
                <div class="row" style={{marginLeft: 75}}>
                    <div class="form-group col-md-2">
                        <label for="fechaI" style={{color: '#AFAFAF'}}>Fecha Inicial</label>
                        <input type="text" class="form-control" id="fechaI" placeholder="AAAA-MM-DD"/>
                    </div>
                    <div class="form-group col-md-2">
                        <label for="fechaF" style={{color: '#AFAFAF'}}>Fecha Inicial</label>
                        <input type="text" class="form-control" id="fechaF" placeholder="AAAA-MM-DD"/>
                    </div>
                    <div class="form-group col-md-2" style={{marginTop: 32}}>
                    <button type="button" class="btn btn-outline-light" onClick={this.filtrarFecha}>Filtrar</button>
                    </div>
                </div>

                <div>
                    {report}      
                </div>

                <div class="row" style={{marginRight: 25, marginLeft: 25, marginTop: 25, marginBottom: 25, textAlign: "center"}}>
                    <div class="col-sm-4" id="divBar">
                        <button type="button" class="btn btn-outline-danger btn-block" onClick={this.setBarras}>Barras</button>
                    </div>
                    <div class="col-sm-4" id="divCake">
                        <button type="button" class="btn btn-outline-danger btn-block" onClick={this.setAmbos}>Ambos</button>
                    </div>
                    <div class="col-sm-4" id="divCake">
                        <button type="button" class="btn btn-outline-danger btn-block" onClick={this.setPastel}>Pastel</button>
                    </div>
                </div >       

                <p>
                    <button class="btn btn-lg btn-block btn-outline-light" type="button" data-toggle="collapse" data-target="#collapseR" aria-expanded="false" aria-controls="collapseR">
                    Reporte Tiempos De Carga
                    </button>
                </p>
                <div class="collapse" id="collapseR">
                    <div class="card card-body">
                        <div class="container">
                            <div style={{marginLeft: 200, textAlign: "center", width: 800, marginTop: 25}}>
                                    <Pastel labels={this.state.timeLabels} data={this.state.timeData} title='REPORTE DE TIEMPOS DE CARGA'/>
                            </div>
                        </div>
                    </div>
                </div>  

                <div>
                    <Tabla columnas={this.state.columnas} tuplas={this.state.dataTable}/>
                </div>
            </form>
        );
    }
}

export default Reportes;