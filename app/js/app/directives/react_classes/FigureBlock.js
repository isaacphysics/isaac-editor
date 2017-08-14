define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, ContentValueOrChildren) {
		return React.createClass({

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onCaptionChange: function(c, oldVal, newVal, oldChildren, newChildren) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.value = newVal;
				newDoc.children = newChildren;

				this.onDocChange(this, oldDoc, newDoc);
			},

			loadImg: function() {

				ContentEditor.fileLoader(this.props.doc.src).then((function(dataUrl){
					$(this.refs.img.getDOMNode()).attr("src", dataUrl);
				}).bind(this)).catch((function(e) {
					console.error("Failed to load image", this.props.doc.src, e);
				}).bind(this));
			},

			onSrcChange: function(newSrc) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.src = newSrc;

				this.onDocChange(this, oldDoc, newDoc);
			},

			selectFile: function(file) {
				var reader = new FileReader();
				var self = this;
				reader.onload = function(e) {
					console.log("Loaded", file);
					ContentEditor.figureUploader(reader.result, file.name).then(function(relativePath) {
						console.log("Newly created relative file path:", relativePath);

						self.onSrcChange(relativePath);
					});
				};

				reader.readAsBinaryString(file)

			},

			componentDidMount: function() {
				this.loadImg();
			},

			componentDidUpdate: function() {
				this.loadImg();
			},

			img_Click: function() {
				this.refs.fileInput.getDOMNode().click();
			},

			img_DragOver: function(e) {
				e.stopPropagation();
				e.preventDefault();
				e.nativeEvent.dataTransfer.dropEffect = "copy";
			},

			img_Drop: function(e) {
				e.stopPropagation();
				e.preventDefault();

				if (e.nativeEvent.dataTransfer.files.length != 1)
					return;

				this.selectFile(e.nativeEvent.dataTransfer.files[0]);
			},

			file_Change: function(e) {
				e.stopPropagation();
				e.preventDefault();

				if (e.target.files.length != 1)
					return;

				this.selectFile(e.target.files[0]);
			},

			render: function() {

				var optionalCaption = !this.props.doc || this.props.doc.type == "image" ? null : <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onCaptionChange}/>;

				return (
					<Block type="figure" blockTypeTitle="Figure" doc={this.props.doc} onChange={this.onDocChange}>
						<div className="row">
							<div className="small-6 columns text-center">
								<img width="250px" height="250px" src="img/not-found.png" ref="img" onClick={this.img_Click} accept="image/svg+xml,image/png" onDragOver={this.img_DragOver} onDrop={this.img_Drop} />
								<input type="file" ref="fileInput" style={{position: "absolute", left: -1000, top: -1000, visibility:"hidden"}} onChange={this.file_Change} />
							</div>
							<div className="small-6 columns">
								{optionalCaption}
							</div>
						</div>
					</Block>
				);
			}
		});;
	}
})
