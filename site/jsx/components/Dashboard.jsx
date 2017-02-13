import React from 'react';
import {connect} from 'react-redux';
import {addHeader, addImage, addQuote, addText, addSubhead, addMetatags,deleteComponent} from '../actions';
var FileSaver = require('file-saver');
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server'

class Dashboard extends React.Component {
    
    static propTypes = {
        componentTypes: React.PropTypes.array.isRequired,
        preloaded_components: React.PropTypes.array.isRequired,
        database_id: React.PropTypes.string.isRequired
    }
    constructor(props) {
        super(props);
        // add syntatic sugar () => {} to prevent exessive bind calls 
        this.state = {  data: {
                            type: this.props.componentTypes[0],
                            payload: {},
                            
                        },
                        edit_component_id: ""
                     };
        this.handleDropdownChange = this.handleDropdownChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleGenPage = this.handleGenPage.bind(this);
        this.activateDashboard = this.activateDashboard.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.showInputForComponentType = this.showInputForComponentType.bind(this);

        // Load all preloaded components
        console.log(this.props.preloaded_components);
        for (var i = 0; i < this.props.preloaded_components.length; i++) {
            var formatted_component_data = {
                'type': this.props.preloaded_components[i].component_type,
                'payload': this.props.preloaded_components[i].component_data
            }

            this.appendPagePreview(this.randomIdentifier(), formatted_component_data);
        }
    }

    render() {
        var componentOptions = this.props.componentTypes.map(function(type, i){
          return (
            <option value={type.replace(/\s/g , "_")}>{type}</option>
          );
        });
        var buttonText = this.props.database_id == '' ? 'Generate Page' : 'Update Page';

        return (
            <div className="dashboard-container" >
                <div className="dashboard-main">
                    <form onSubmit={this.handleSubmit}>
                        <div className="dropdown">
                            {/*<label for="dropdown">Select component:</label>*/}
                            <div>
                                <div>
                                    <select value={this.state.data.type} onChange={this.handleDropdownChange} className="form-control">
                                        {componentOptions}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="component-inputs">
                            <div>{this.showInputForComponentType(this.state.data.type)}</div>
                        </div>
                        <div>
                            <input className="btn btn-primary btn-submit" type='submit'></input>
                        </div>
                    </form>
                </div>
                <div className="dashboard-sub" onClick={this.activateDashboard}>
                    <button>EDIT</button>
                </div>
                <button onClick={this.handleGenPage} className="btn btn-primary btn-generate">{buttonText}</button>
            </div>
        );
    }

    handleDropdownChange(event) {
        //updates type from dropdown & clears input fields after submit
        this.setState({
            data: {
                type: event.target.value,
                payload: {}
            }
        });
    }

    handleSubmit(event) {
        // console.log('A component was submitted: ' + this.state.data.type);
        // console.log(this.state);

        event.preventDefault();
        if (this.state.edit_component_id !== "") {
            this.appendPagePreview(this.state.edit_component_id, this.state.data);
            this.setState({
                edit_component_id: ""
            });
            return;
        }

        var identifier = this.randomIdentifier();
        this.appendPagePreview(identifier, this.state.data);
    }

    randomIdentifier() {
        return Math.random().toString(36).substring(7);
    }

    appendPagePreview(store_id, data) {
        const component_params = data.payload;
        const button = <button onClick={()=>this.handleEdit(store_id)}>Edit</button>;
        const delete_button = <button onClick={()=> this.props.dispatch(deleteComponent(store_id))}>Delete</button>;
        const button_group = (
                <div>
                    {button}
                    {delete_button}
                </div>
            );
        // add delete button here
        switch (data.type) {
            case "header":
                this.props.dispatch(addHeader(
                    component_params.title, 
                    component_params.author, 
                    component_params.image, 
                    store_id, 
                    button_group,
                    'header',
                    ));
                this.props.dispatch(addMetatags(component_params.title, component_params.image, 'header'));
                break;
            case "image":
                this.props.dispatch(addImage(
                        component_params.url,
                        component_params.credit,
                        component_params.caption,
                        store_id,
                        button_group,
                        'image',
                    ));
                break;
            case "quote":
                this.props.dispatch(addQuote(component_params.quoteText, component_params.quoteSource, store_id,button_group,'quote'));
                break;
            case "subhead":
                this.props.dispatch(addSubhead(component_params.text,store_id,button_group,'subhead'));
                break;
            case "text_section":
                this.props.dispatch(addText(component_params.text, store_id,button_group,'text_section'));
                break;
            default:
                console.log("Component category not supported.");
        }

        this.setState({
            data:{
                type: this.state.data.type,
                payload: {}
            }
        });
    }

    handleEdit(id) {
        let redux_store = this.props.store.getState()._dashboard;
        for (var i = 0; i< redux_store.length; i++) {
            let item_props = redux_store[i].props;
            // console.log(redux_store[i]);
            if (id === item_props.database_id) {
                switch (item_props.type) {
                    case "header":
                        this.setState({
                            data:{
                                type: item_props.type,
                                payload: {
                                    title: item_props.title,
                                    author: item_props.author,
                                    image: item_props.image,
                                }
                            },
                            edit_component_id: id,
                        });
                        break;
                    case "subhead":
                        this.setState({
                            data:{
                                type: item_props.type,
                                payload: {
                                    text: item_props.text,
                                }
                            },
                            edit_component_id: id,
                        })
                        break;
                    case "image":
                        this.setState({
                            data: {
                                type: item_props.type,
                                payload: {
                                    url:item_props.url,
                                    caption: item_props.caption,
                                    credit: item_props.credit,
                                }
                            },
                            edit_component_id: id,
                        });
                        break;
                    case "quote":
                        this.setState({
                            data: {
                                type: "quote",
                                payload: {
                                    quoteText: item_props.quoteText,
                                    quoteSource: item_props.quoteSource,
                                }
                            },
                            edit_component_id: id,
                        })
                        break;
                    case "text_section":
                        this.setState({
                            data: {
                                type: "text_section",
                                payload: {
                                    text: item_props.text,
                                }
                            },
                            edit_component_id: id,
                        });
                        break;
                }
                break;
            }
        }
    }

    handleGenPage(event) {
        event.preventDefault();

        // Use React.renderToStaticMarkup to convert each react component into HTML
        // Collect all HTML pieces and then save them to a file using FileSaver.js
     
        let redux_store = this.props.store.getState()._dashboard;
        let redux_header = this.props.store.getState()._header;
        let content = "";
        if (redux_header.length > 0) {
            content = "<head>" + redux_header[0] + "</head>";
        }

        var num_components = redux_store.length;
        var submitted_components = [];

        for (var i = 0; i < num_components; i++) {
            if (redux_store[i].props.database_id !== undefined) {
                content = content + ReactDOMServer.renderToStaticMarkup(redux_store[i].props.component)

                // Array for db insertion
                var data = {"component_data": redux_store[i].props.component.props, "component_type": redux_store[i].props.type};
                submitted_components.push(data);
            }
        }
        var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, "index.html");

        // Save to database from submitted_components
        $.ajax({
          url: '/gen',
          type: 'POST',
          data: {
            "data": JSON.stringify(submitted_components), 
            "current_id": JSON.stringify(this.props.database_id)
          },
          type: 'POST'
        });

        this.setState({
            data: {
                type: this.state.data.type,
                payload: {}
            }
        });
    }

    updateInput(value, event) {

        let updatedObj = {};
        updatedObj[value] = event.target.value;

        this.setState({
            data:{
                type: this.state.data.type,
                payload: Object.assign({}, this.state.data.payload, updatedObj)
            }
        });
    }

    showInputForComponentType(componentType) {
        switch(this.state.data.type) {
            case 'header':
                return(
                    <div>
                        <div className="component-input">
                            <label for="title">Title:</label>
                            <input
                                placeholder="Title" 
                                type="text" name="title" 
                                onChange={this.updateInput.bind(this, 'title')} 
                                className="form-control"
                                value={this.state.data.payload.title}/>
                        </div>
                        <div className="component-input">    
                            <label for="author">Author:</label>                   
                            <input
                                placeholder="Author"
                                type="text" name="author"
                                onChange={this.updateInput.bind(this, 'author')}
                                className="form-control"
                                value={this.state.data.payload.author}/>
                        </div>
                        <div className="component-input">
                            <label for="url">Cover Image URL:</label>
                            <input
                                placeholder="Cover image URL"
                                type="text" name="url"
                                onChange={this.updateInput.bind(this, 'image')}
                                className="form-control"
                                value={this.state.data.payload.image}/>
                        </div>
                    </div>
                );
            case 'subhead':
                return(
                    <div>
                        <div className="component-input">
                            <label for="subhead">Subhead:</label>
                            <input 
                                placeholder="Subhead" 
                                type="text" 
                                name="subhead" 
                                onChange={this.updateInput.bind(this, 'text')} 
                                className="form-control"
                                value={this.state.data.payload.text} />
                        </div>
                    </div>
                );
            case 'image':
                return(
                    <div>
                        <div className="component-input">
                            <label for="url">URL:</label>
                            <input 
                                placeholder="URL" type="text" name="url"
                                onChange={this.updateInput.bind(this, 'url')}
                                className="form-control"
                                value={this.state.data.payload.url}/>
                        </div>
                        <div className="component-input">
                            <label for="credit">Credit:</label>
                            <input
                                placeholder="Credit" type="text" name="credit" 
                                onChange={this.updateInput.bind(this, 'credit')}
                                className="form-control"
                                value={this.state.data.payload.credit}/>
                        </div>
                        <div className="component-input">
                            <label for="caption">Caption:</label>
                            <input
                                placeholder="Caption" type="text" name="caption"
                                onChange={this.updateInput.bind(this, 'caption')}
                                className="form-control"
                                value={this.state.data.payload.caption}/>
                        </div>
                    </div>
                );
            case 'quote':

                return(
                    <div>
                        <div className="component-input">
                            <label for="quote">Quote:</label>
                            <input 
                                placeholder="Quote" 
                                type="text" 
                                name="quote" 
                                onChange={this.updateInput.bind(this, 'quoteText')} 
                                className="form-control"
                                value={this.state.data.payload.quoteText} />
                        </div>
                        <div className="component-input">
                            <label for="quoteMaker">Quote Maker:</label>
                            <input 
                                placeholder="Quote Maker" 
                                type="text" 
                                name="quoteMaker" 
                                onChange={this.updateInput.bind(this, 'quoteSource')} 
                                className="form-control"
                                value={this.state.data.payload.quoteSource} />
                        </div>
                    </div>
                );
            case 'text_section':
                return(
                    <div className="component-input text">
                        <label for="text">Text:</label>
                        <textarea 
                            name="text" 
                            rows="3"
                            className="form-control"
                            onChange={this.updateInput.bind(this, 'text')}>
                        {this.state.data.payload.text}
                        </textarea>
                    </div>
                );
            default:
                return(<p>nothing</p>);
        }
    }

    activateDashboard(){
        let app = document.querySelector('.app-container');
        app.classList.remove('preview');
    }

}

// this has no purpose at the moment since dasboard will not change typically
const mapStateToProps = (state) => {
        return {
            src:state._dashboard.src,
            caption: state._dashboard.caption,
            credit: state._dashboard.credit,
        };
};

var ConnectedDashboard = connect(mapStateToProps)(Dashboard);

export default ConnectedDashboard;

// currently keep track of one thing which is componnent rendering 
