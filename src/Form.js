import React, { Component } from 'react';
import styles from  './Form.module.css'; 

class Form extends Component {

	constructor(props) {
	    super(props);
	    this.state = {
	    	id: '',
	    	favorite:'false',
	    	year: '',
	    	name: '',
	    	value: '',
	    	estimate: '',
	    	grade: '',
	    	mint: '',
	    	uscoinbook: '',
	    	notes: ''
	    };

	    this.handleChange = this.handleChange.bind(this);
	    this.handleSubmit = this.handleSubmit.bind(this);
		this.buttonRef = React.createRef();
	}

	handleChange(event) {
		this.setState({[event.target.name]: event.target.value});
	}

	handleSubmit(event) {
		event.preventDefault();
		this.setState({submitting: 'disabled'});
		this.props.form()
		
	}

	render() {

	    return (

	    	<form className={styles.form} onSubmit={this.handleSubmit}>

	    		<label htmlFor="id">ID</label>
	    		<input type="text" id="id" name="id" placeholder="0001" value={this.state.id} onChange={this.handleChange} />

				<label htmlFor="favorite">Favorite</label>
				<select value={this.state.favorite}  id="favorite" name="favorite"  onChange={this.handleChange} >
					<option value="false">false</option>
					<option value="true">true</option>
				</select>

	    		<label htmlFor="year">Year</label>
	    		<input type="text" id="year" name="year" placeholder="1988" value={this.state.year} onChange={this.handleChange} />

	    		<label htmlFor="name">Name</label>
	    		<input type="text" id="name" name="name" placeholder="Silver Dollar" value={this.state.name} onChange={this.handleChange} />

	    		<label htmlFor="value">Value</label>
	    		<input type="text" id="value" name="value" placeholder="1" value={this.state.value} onChange={this.handleChange} />

	    		<label htmlFor="uscoinbook">US Coin Book</label>
	    		<input type="text" id="uscoinbook" name="uscoinbook" placeholder="https://" value={this.state.uscoinbook} onChange={this.handleChange} />

	    		<label htmlFor="estimate">Estimate</label>
	    		<input type="text" id="estimate" name="estimate" placeholder="100" value={this.state.estimate} onChange={this.handleChange} />

	    		<label htmlFor="grade">Grade</label>
	            <select value={this.state.grade}  id="grade" name="grade" onChange={this.handleChange} >
					<option></option>
					<option value="Proof">Proof</option>
					<option value="Uncirculated">Uncirculated</option>
					<option value="Extra Fine">Extra Fine</option>
					<option value="Very Fine">Very Fine</option>
					<option value="Fine">Fine</option>
					<option value="Very Good">Very Good</option>
					<option value="Good">Good</option>
					<option value="Bad">Bad</option>
	            </select>

	    		<label htmlFor="mint">Mint</label>
	    		<select value={this.state.mint}  id="mint" name="mint" onChange={this.handleChange} >
	    			<option></option>
					<option value="P">Philadelphia</option>
					<option value="CC">Carson City</option>
					<option value="C">Charlotee</option>
					<option value="D">Denver</option>
					<option value="O">New Orleans</option>
					<option value="S">San Francisco</option>
					<option value="W">West Point</option>
					<option value="N">No Mint Mark</option>
	            </select>

	            <label htmlFor="notes">Notes</label>
	            <textarea value={this.state.notes} id="notes" name="notes" onChange={this.handleChange} />

	            <div>
	            	<button ref={this.buttonRef} disabled={this.state.submitting}>Submit</button>
	            </div>

	    	</form>
	    );
	 }
	 
}

export default Form; // Don’t forget to use export default!