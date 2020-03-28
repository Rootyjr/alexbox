import React from 'react';
import {Table, Form, Input, Label, InputGroup, FormGroup, Button, UncontrolledTooltip, Spinner} from 'reactstrap';
import axios from 'axios';


class Editor extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            gridItems: [],
            selectedTile: null,
            isSyncing: true
        }


        this.handleGridClick = this.handleGridClick.bind(this);
        this.squareClick = this.squareClick.bind(this);
        this.handleTitle = this.handleTitle.bind(this);
        this.handleMPV = this.handleMPV.bind(this);
        this.handleDuration = this.handleDuration.bind(this);
        this.handleColor = this.handleColor.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.toggleModifiedCallbackTrue = this.props.toggleModifiedCallbackTrue;
        this.toggleModifiedCallbackFalse = this.props.toggleModifiedCallbackFalse;
        this.update = this.update.bind(this);
    }

    componentDidMount(){
        //Attempt fetch of contents.
        const interval = setInterval(axios({
                method: 'get',
                url: '/tile',
                config: { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } } 
            })
            .then(res => {
                var gridItems = res.data;
                var normalizedGridItems = [];
                for (var i =0; i<gridItems.length; i++){
                    var item = gridItems[i];
                    item.modified = false;
                    item.deleted = false;
                    normalizedGridItems.push(item);
                }
                this.setState({gridItems: normalizedGridItems, isSyncing: false});
                clearInterval(interval);
        }), 2000);
        const interval2 = setInterval(this.update, 200);
    }

    update(){
        var modified = false;
        for (var i =0; i<this.state.gridItems.length; i++){
            if(this.state.gridItems[i].modified==true){
                modified=true;
            }
        }
        if(modified==true){
            this.toggleModifiedCallbackTrue();
        }else{
            this.toggleModifiedCallbackFalse();
        }
    }

    handleGridClick(e){
        e.preventDefault();
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        if((x/((rect.right-rect.left)/8)) >= 1 && (y/((rect.bottom-rect.top)/50)) >= 2){
            var item = {};
            item.id = -1
            item.title = "No Title"
            item.mpv = "MPV Command"
            item.modified = true;
            item.day = Math.floor(x/((rect.right-rect.left)/8))-1
            item.time = Math.floor(y/((rect.bottom-rect.top)/50))/2-1
            item.duration = .5
            item.deleted = false

            var colors = ['1']
            var i  = Math.floor(Math.random() * 6);
            item.color = colors[0];
            var gridItems = this.state.gridItems;
            gridItems.push(item)
            this.setState({gridItems: gridItems, selectedTile: gridItems.length-1});
        }
    }


    sync(){
        this.setState({isSyncing: true});
        var elements_to_delete = [];
        var elements_to_update = [];
        var elements_to_create = [];
        var gridItems = this.state.gridItems;
        for(var i = 0;i<gridItems.length;i++){
            if(gridItems[i].modified==true){
                if(gridItems[i].id != -1 && gridItems[i].deleted == true){
                    var object = new Object();
                    object.id = gridItems[i].id.toString();
                    elements_to_delete.push(object);
                }else if(gridItems[i].id != -1 && gridItems[i].deleted != true){
                    var object = new Object();
                    object.id = gridItems[i].id.toString();
                    object.title = gridItems[i].title.toString();
                    object.mpv = gridItems[i].mpv.toString();
                    object.day = gridItems[i].day.toString();
                    if(gridItems[i].time*2 % 2==1){
                        if(gridItems[i].time<10){
                            object.time = "1970-01-01 0"+(gridItems[i].time-.5)+":30:00";
                        }else{
                            object.time = "1970-01-01 "+(gridItems[i].time-.5)+":30:00";
                        }
                    }else{
                        if(gridItems[i].time<10){
                            object.time = "1970-01-01 0"+(gridItems[i].time)+":00:00";
                        }else{
                            object.time = "1970-01-01 "+(gridItems[i].time)+":00:00";
                        }
                    }
                    object.duration = gridItems[i].duration.toString();
                    object.color = gridItems[i].color.toString();
                    elements_to_update.push(object);
                }else if(gridItems[i].id == -1){
                    var object = new Object();
                    object.title = gridItems[i].title.toString();
                    object.mpv = gridItems[i].mpv.toString();
                    object.day = gridItems[i].day.toString();
                    if(gridItems[i].time*2 % 2==1){
                        if(gridItems[i].time<10){
                            object.time = "1970-01-01 0"+(gridItems[i].time-.5)+":30:00";
                        }else{
                            object.time = "1970-01-01 "+(gridItems[i].time-.5)+":30:00";
                        }
                    }else{
                        if(gridItems[i].time<10){
                            object.time = "1970-01-01 0"+(gridItems[i].time)+":00:00";
                        }else{
                            object.time = "1970-01-01 "+(gridItems[i].time)+":00:00";
                        }
                    }
                    object.duration = gridItems[i].duration.toString();
                    object.color = gridItems[i].color.toString();
                    elements_to_create.push(object);
                }
            }
        }
        axios({
            method: 'delete',
            url: '/tile',
            data: elements_to_delete,
            config: { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } }
        }).then(response => {
            var self1 = this;
            axios({
                method: 'put',
                url: '/tile',
                data: elements_to_update,
                config: { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } }
            }).then(response => {
                var self2 = self1;
                axios({
                    method: 'post',
                    url: '/tile',
                    data: elements_to_create,
                    config: { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache'  } }
                }).then(response => {
                    var self3 = self2;
                    const interval = setInterval(axios.get('/tile')
                        .then(res => {
                            var gridItems = res.data;
                            var normalizedGridItems = [];
                            for (var i =0; i<gridItems.length; i++){
                                var item = gridItems[i];
                                item.modified = false;
                                item.deleted = false;
                                normalizedGridItems.push(item);
                            }
                            self3.setState({gridItems: normalizedGridItems, isSyncing: false, selectedTile: null});
                            clearInterval(interval);
                        }), 2000);
                }).catch(function(error) {
                    alert("Creating a thing has failed somehow.")
                    console.log(error);
                });
            }).catch(function(error) {
                alert("Updating a thing has failed somehow.")
                console.log(error);
            });
        }).catch(function(error) {
            alert("Deleting a thing has failed somehow.")
            console.log(error);
        });
    }

    handleTitle(e, index){
        e.preventDefault();
        var gridItems = this.state.gridItems;
        gridItems[index].title = e.target.value;
        gridItems[index].modified = true;
        this.setState({gridItems: gridItems});
    }

    handleMPV(e, index){
        e.preventDefault();
        var gridItems = this.state.gridItems;
        gridItems[index].mpv = e.target.value;
        gridItems[index].modified = true;
        this.setState({gridItems: gridItems});
    }

    handleDuration(e, index){
        e.preventDefault();
        var gridItems = this.state.gridItems;
        var new_duration = parseFloat(e.target.value);

        if(e.target.value % .5 == 0 && e.target.value >= .5 && (gridItems[index].time + new_duration) <= 24){
            var ok = true;
            for(var i = 0;i<gridItems.length;i++){
                if(i!=index){
                    var tile = gridItems[index];
                    var other_tile = gridItems[i];
                    if(other_tile.time > tile.time && other_tile.time < (tile.time + new_duration) && other_tile.day == tile.day){
                        ok = false;
                    }
                }
            }
            if(ok){
                gridItems[index].duration = new_duration;
                gridItems[index].modified = true;
                this.setState({gridItems: gridItems});
            }
        }
    }

    handleColor(e, index){
        e.preventDefault();
        if(e.target.value > 0 && e.target.value < 6){
            var gridItems = this.state.gridItems;
            gridItems[index].color = e.target.value;
            gridItems[index].modified = true;
            this.setState({gridItems: gridItems});
        }
    }

    handleDelete(e, index){
        e.preventDefault();
        //If no ID simply remove it.
        var oldGridItems = this.state.gridItems;
        if(oldGridItems[index].id==-1){
            var newGridItems = [];
            for(var i = 0;i<oldGridItems.length;i++){
                if(i!=index){
                    newGridItems.push(oldGridItems[i]);
                }
            }
            this.setState({gridItems: newGridItems, selectedTile:null});
        }else{
            oldGridItems[index].deleted=true;
            oldGridItems[index].modified=true;
            this.setState({gridItems: oldGridItems, selectedTile:null});
        }
    }

    squareClick(e,index){
        e.preventDefault();
        e.stopPropagation();
        this.setState({selectedTile:index});
    }

    render() {
        if(this.props.shouldSync){
            this.sync();
            this.props.syncCallback();
        }

        var dayItems = ["#", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var rows = [];
        for(var i = 0; i<25;i++){
                rows[i] = [];
                for(var x = 0; x<8;x++){
                    if(i == 0){
                        rows[i].push(<th>{dayItems[x]}</th>);
                    }
                    else if(x == 0){
                        rows[i].push(<th className="side">{i-1}</th>);
                    }
                    else{
                        rows[i].push(<td></td>);
                    }
                }
        }

        return !this.state.isSyncing ? (
            <div className="editor-wrapper">
                <div className="time-table">
                    <div onClick={this.handleGridClick} className="grid">
                        {this.state.gridItems.map((value, index) => {
                            var start = value.time*2+3 //We subtracted an extra 1 to make it 0 in times.
                            var stop = value.time*2+3 + value.duration*2
                            var day = value.day+2;
                            var color = value.color;
                            var title = value.title;
                            if (index == this.state.selectedTile){
                                color = "selected";
                            }
                            if(!value.deleted){
                                return( 
                                <div className={"tile tile-color-"+color} key={index} id={"tile"+index} onClick={(e) => this.squareClick(e, index)} style={{gridArea: start + "/" + day + "/" + stop + "/" + (day+1)}}>
                                    {title}
                                    <UncontrolledTooltip placement="right" target={"tile"+index}>
                                        {title}
                                    </UncontrolledTooltip>
                                </div>)
                            }
                        })}
                    </div>
                    <Table bordered className="table">
                        {rows.map((value, index) => {
                            return <tr>{value}</tr>
                        })}
                    </Table>
                </div>
                <Config handleDelete={this.handleDelete} handleTitle={this.handleTitle} handleDuration={this.handleDuration} handleColor={this.handleColor} handleMPV={this.handleMPV} selectedTile={this.state.selectedTile} gridItems={this.state.gridItems} className="config-panel"/>
            </div>
        ) : (<div class="syncSpace"><Spinner style={{margin: "auto", width: '3rem', height: '3rem'}} color="info"/></div>) ;
    }
}

class Config extends React.Component {
    constructor(props){
        super(props);
        this.handleTitle = this.props.handleTitle;
        this.handleMPV = this.props.handleMPV;
        this.handleDuration = this.props.handleDuration;
        this.handleColor = this.props.handleColor;
        this.handleDelete = this.props.handleDelete;
    }
    
    render(){
        if(this.props.selectedTile != null){
            var tile = this.props.gridItems[this.props.selectedTile];
            var time = "";
            
            if(tile.time % 1 == .5){
                time+=Math.floor(tile.time);
                time+=":30"
            }else{
                time+=Math.floor(tile.time);
                time+=":00"
            }

            time+="-";
            
            if((tile.time+tile.duration) % 1 == .5){
                time+=Math.floor(tile.time+tile.duration);
                time+=":30"
            }else{
                time+=Math.floor(tile.time+tile.duration);
                time+=":00"
            }

            time+=" on ";

            switch (tile.day){
                case 0: time+="Sunday";break;
                case 1: time+="Monday";break;
                case 2: time+="Tuesday";break;
                case 3: time+="Wednesday";break;
                case 4: time+="Thursday";break;
                case 5: time+="Friday"; break;
                case 6: time+="Saturday";break;
            }
        }
        return (this.props.selectedTile != null) ? (
            <div className="config-panel">
            <div className="config-panel-inner">
                <div className="form">
        <h3>{tile.title}<br/><span style={{fontSize:".8rem"}}> from {time}</span></h3>
                <hr/>
                <Form>
                    <FormGroup>
                        <Label htmlFor="Title">Title</Label>
                        <Input placeholder="Title" id="Title" maxlength="50"  onChange={(e) => this.handleTitle(e, this.props.selectedTile)} value={this.props.gridItems[this.props.selectedTile].title} type="text"/>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="MPV">MPV Command</Label>
                        <Input placeholder="MPV Command" id="MPV" maxlength="1000" onChange={(e) => this.handleMPV(e, this.props.selectedTile)} value={this.props.gridItems[this.props.selectedTile].mpv} type="textarea"/>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="Duration">Duration (Hrs)</Label>
                        <Input placeholder="0.5" id="Duration" step="0.5" onChange={(e) => this.handleDuration(e, this.props.selectedTile)} value={this.props.gridItems[this.props.selectedTile].duration} type="number"/>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="Color">Color</Label>
                        <Input id="Color" onChange={(e) => this.handleColor(e, this.props.selectedTile)} value={this.props.gridItems[this.props.selectedTile].color} type="select">
                            <option value="1">Green</option>
                            <option value="2">Yellow</option>
                            <option value="3">Orange</option>
                            <option value="4">Red</option>
                            <option value="5">Pink</option>
                        </Input>
                    </FormGroup>
                    <FormGroup className="rightside">
                        <Button color="danger" onClick={(e) => this.handleDelete(e, this.props.selectedTile)}>Delete</Button>
                    </FormGroup>
                </Form>
                </div>
            </div>
        </div>
        ) : (
            <div className="config-panel">
                <div className="config-panel-inner">
                    <div className="form">
                    <h3>No element selected</h3>
                    <h6>Click on a event or time slot to get started</h6>
                    </div>
                </div>
            </div>
        );
    }
}




  export default Editor;