// borrowed from https://mozilla.github.io/pdf.js/examples/index.html#interactive-examples

// If absolute URL from the remote server is provided, configure the CORS
// header on that server.

class PdfManager {

	constructor(canvasElement){
		this.pdfDoc = null;
		this.pageNum = 1;
		this.pageRendering = false;
		this.pageNumPending = null;
		this.scale = 1.0;
		this.canvas = canvasElement;//document.getElementById('the-canvas')
		this.ctx = this.canvas.getContext('2d');
		
		// Loaded via <script> tag, create shortcut to access PDF.js exports.
		this.pdfjsLib = window['pdfjs-dist/build/pdf'];

		// The workerSrc property shall be specified.
		this.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";
	}

	/**
	 * Get page info from document, resize canvas accordingly, and render page.
	 * @param num Page number.
	 */
	renderPage(num) {
	  this.pageRendering = true;
	  
	  // Using promise to fetch the page
	  this.pdfDoc.getPage(num).then((page) => {
		let viewport = page.getViewport({scale: this.scale});
		this.canvas.height = viewport.height;
		this.canvas.width = viewport.width;

		// Render PDF page into canvas context
		let renderContext = {
		  canvasContext: this.ctx,
		  viewport: viewport
		};
		let renderTask = page.render(renderContext);

		// Wait for rendering to finish
		renderTask.promise.then(() => {
		  this.pageRendering = false;
		  if (this.pageNumPending !== null) {
			// New page rendering is pending
			this.renderPage(this.pageNumPending);
			this.pageNumPending = null;
		  }
		});
	  });

	  // Update page counters
	  document.getElementById('page_num').textContent = num;
	}

	/**
	 * If another page rendering in progress, waits until the rendering is
	 * finished. Otherwise, executes rendering immediately.
	 */
	queueRenderPage(num) {
	  if (this.pageRendering) {
		this.pageNumPending = num;
	  } else {
		this.renderPage(num);
	  }
	}

	/**
	 * Displays previous page.
	*/
	onPrevPage() {
	  if (this.pageNum <= 1) {
		return;
	  }
	  this.pageNum--;
	  this.queueRenderPage(this.pageNum);
	}

	/**
	 * Displays next page.
	*/
	onNextPage() {
	  if (this.pageNum >= this.pdfDoc.numPages) {
		return;
	  }
	  this.pageNum++;
	  this.queueRenderPage(this.pageNum);
	}

	/**
	 * Asynchronously downloads PDF.
	 
	pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
	  pdfDoc = pdfDoc_;
	  document.getElementById('page_count').textContent = pdfDoc.numPages;

	  // Initial/first page rendering
	  renderPage(pageNum);
	});

	*/

	findScorePage(time, timeMarkers){
		// given time in seconds and a map of pages to times (in sec),
		// find what the page should be at that time.
		let pageToBeOn = 1;
		for(let page in timeMarkers){
			if(time <= timeMarkers[page]){
				pageToBeOn = parseInt(page);
				break;
			}
		}
		return pageToBeOn;
	}

	async loadScore(scorePath){
		return this.pdfjsLib.getDocument(scorePath).promise.then((pdfDoc_) => {
		  this.pdfDoc = pdfDoc_;
		  document.getElementById('page_count').textContent = this.pdfDoc.numPages;

		  // Initial/first page rendering
		  this.renderPage(this.pageNum);
		  
		  return true;
		});
	}
}

export {
	PdfManager
}