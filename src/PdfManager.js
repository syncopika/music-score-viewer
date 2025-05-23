// borrowed from https://mozilla.github.io/pdf.js/examples/index.html#interactive-examples

// If absolute URL from the remote server is provided, configure the CORS
// header on that server.

export class PdfManager {
  constructor(updateStateFunc){
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 1.0;
    this.canvas = null;
    this.ctx = null;
        
    // use this function to update the state of ScoreDisplay
    this.updateUiState = updateStateFunc;
        
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    this.pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
  }
    
  setCanvas(canvasElement){
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  renderPage(num) {
    this.pageRendering = true;
      
    // Using promise to fetch the page
    this.pdfDoc.getPage(num).then((page) => {
      let viewport = page.getViewport({scale: 1});
        
      let scale = this.canvas.parentNode.clientWidth / viewport.width; // try to make canvas responsive to client viewport
      scale = scale > 1 ? 1.0 : scale; // don't let it exceed 1
        
      viewport = page.getViewport({scale: scale});
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };
      const renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(() => {
        this.pageRendering = false;
        this.pageNum = num;
          
        // Update page counters
        this.updateUiState({
          'currPage': num,
        });
      
        if (this.pageNumPending !== null) {
          // New page rendering is pending
          this.renderPage(this.pageNumPending);
          this.pageNumPending = null;
        }
      });
    });

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
    let pageToBeOn = parseInt(Object.keys(timeMarkers)[0]);
    for(const page in timeMarkers){
      if(time <= timeMarkers[page]){
        pageToBeOn = parseInt(page);
        break;
      }
    }
    return pageToBeOn;
  }
    
  async loadScore(scorePath, pageToRenderInitially){
    return this.pdfjsLib.getDocument(scorePath).promise.then((pdfDoc_) => {
      this.pdfDoc = pdfDoc_;
          
      this.updateUiState({'totalPages': this.pdfDoc.numPages});

      // Initial/first page rendering
      this.pageNum = pageToRenderInitially;
      this.renderPage(pageToRenderInitially);
          
      return true;
    });
  }
}