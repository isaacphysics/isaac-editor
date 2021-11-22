define(["react"], function(React) {
    var tinyBtnCls = "button tiny secondary radius";
    var tinyBtnCSS = {padding: "0.5rem", background: "none", border: "solid 1px lightgrey"};
    var actionBtnCls = "button tiny radius";
    var selectCSS = {"width": "auto", "padding-right": "1rem"};

    var audienceOptions = ["open", "closed"];
    var nonAudienceOptions = ["closed", "de-emphasised", "hidden"];

    return function(ContentEditor) {
        return React.createClass({
            getInitialState: function() {
                return {
                    localDisplay: this.props.display || {audience: [], nonAudience: []},
                    editing: false,
                };
            },

            updateSelection: function(field, previousValue) {
                return function(event) {
                    var newDisplay = Object.assign({}, this.state.localDisplay);
                    newDisplay[field] = this.state.localDisplay[field]
                        .filter(value => value !== previousValue)
                        .concat([event.target.value]);
                    this.setState({localDisplay: newDisplay});
                }.bind(this);
            },

            deleteSelection: function(field, previousValue) {
                return function() {
                    var newDisplay = Object.assign({}, this.state.localDisplay);
                    newDisplay[field] = this.state.localDisplay[field]
                        .filter(value => value !== previousValue)
                    this.setState({localDisplay: newDisplay});
                }.bind(this);
            },

            addSelection: function(field, possibleFields, currentFields) {
                return function() {
                    var newDisplay = Object.assign({}, this.state.localDisplay);
                    newDisplay[field] = this.state.localDisplay[field]
                        .concat(this.getRemainingValues(possibleFields, currentFields)[0]);
                    this.setState({localDisplay: newDisplay});
                }.bind(this);
            },

            getRemainingValues: function(possibleFields, currentFields) {
                return possibleFields.filter(possibleField => currentFields.indexOf(possibleField) === -1);
            },

            saveChanges: function() {
                this.props.onDisplayChange(this.state.localDisplay);
                this.setState({editing: false});
            },

            cancelChanges: function() {
                this.setState({editing: false, localDisplay: this.props.display});
            },

            clearDisplay: function() {
                this.props.onDisplayChange(null);
                this.setState({editing: false, localDisplay: {audience: [], nonAudience: []}});
            },

            render: function() {
                return <div>
                    {/* Display mode (concise representation) */}
                    {!this.state.editing && <div>
                        {this.props.display && (this.props.display.audience.length !== 0 || this.props.display.nonAudience.length !== 0) ?
                            <span>
                                <span>Audience:&nbsp;{this.state.localDisplay.audience.length ? "[" + this.state.localDisplay.audience.join(", ") + "]" : "default"}</span>
                                &nbsp;&nbsp;
                                <span>Non-audience:&nbsp;{this.state.localDisplay.nonAudience.length ? "[" + this.state.localDisplay.nonAudience.join(", ") + "]" : "default"}</span>
                            </span> :
                            "default"
                        }
                        &nbsp;&nbsp;
                        <button className={actionBtnCls} onClick={() => this.setState({editing: !this.state.editing})}>Edit</button>
                    </div>}

                    {/* Edit mode */}
                    {this.state.editing && <div>
                        <div>
                            Audience:&nbsp;[
                            {this.state.localDisplay.audience.length === 0 && "(default) "}
                            {this.state.localDisplay.audience.map((selection, i, selections) => <span>
                                <select value={selection} style={selectCSS} onChange={this.updateSelection("audience", selection)}>
                                    {audienceOptions.map(option => <option value={option}>{option}</option>)}
                                    {audienceOptions.indexOf(selection) === -1 && <option value={selection}>{selection}</option>}
                                </select>
                                <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.deleteSelection("audience", selection)}>
                                    🗙
                                </button>
                                {i < selections.length - 1 && ", "}
                            </span>)}
                            {this.getRemainingValues(audienceOptions, this.state.localDisplay.audience).length > 0 &&
                                <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.addSelection("audience", audienceOptions, this.state.localDisplay.audience)}>
                                    ➕
                                </button>
                            }
                            {"] "}
                            &nbsp;&nbsp;
                            Non-Audience:&nbsp;[
                            {this.state.localDisplay.nonAudience.length === 0 && "(default) "}
                            {this.state.localDisplay.nonAudience.map((selection, i, selections) => <span>
                                <select value={selection} style={selectCSS} onChange={this.updateSelection("nonAudience", selection)}>
                                    {nonAudienceOptions.map(option => <option value={option}>{option}</option>)}
                                    {nonAudienceOptions.indexOf(selection) === -1 && <option value={selection}>{selection}</option>}
                                </select>
                                <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.deleteSelection("nonAudience", selection)}>
                                    🗙
                                </button>
                                {i < selections.length - 1 && ", "}
                            </span>)}
                            {this.getRemainingValues(audienceOptions, this.state.localDisplay.nonAudience).length > 0 &&
                                <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.addSelection("nonAudience", nonAudienceOptions, this.state.localDisplay.nonAudience)}>
                                    ➕
                                </button>
                            }
                            {"] "}
                        </div>
                        <div>
                            <button className={actionBtnCls} onClick={this.saveChanges}>
                                Set
                            </button> &nbsp;
                            <button className={actionBtnCls + " secondary"} onClick={this.cancelChanges}>
                                Cancel
                            </button> &nbsp;
                            <button className={actionBtnCls + " alert"} onClick={this.clearDisplay}>
                                Clear
                            </button>
                        </div>
                    </div>}
            </div>
            }
        });
    }
});

