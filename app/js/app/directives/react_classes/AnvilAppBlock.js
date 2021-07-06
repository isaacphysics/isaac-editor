define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block) {
		return React.createClass({

			getInitialState: function() {
				return {
					editedAppId: this.props.doc.appId,
					editedAccessKey: this.props.doc.appAccessKey
				};
			},

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},


			render: function() {

				return (
					<Block type="anvilApp" blockTypeTitle="Anvil App" doc={this.props.doc} onChange={this.onDocChange}>
						<div style={{color: "#bbb"}} className="text-center"><i>App height will be correct on live pages.</i></div><br/><br/>
						<iframe style={{width: "100%", height: "300px"}} src={"https://" + this.props.doc.appId + ".anvil.app/" + this.props.doc.appAccessKey}/>
					</Block>
				);
			}
		});
	}
})
