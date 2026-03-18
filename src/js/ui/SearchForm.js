export class SearchForm {
    constructor(formId, onSearch) {
        this.form = document.getElementById(formId);
        this.checkBtn = document.getElementById("check-btn");
        this.progressBlock = document.getElementById("progress-block");
        this.resultCard = document.getElementById("result-card");

        this.onSearch = onSearch; 
        this.form.onsubmit = (e) => this.handleSubmit(e);
    }

    toggleProgress(show) {
        this.progressBlock.classList.toggle("progress-block-visible", show);
        this.checkBtn.disabled = show;
        if (show) this.resultCard.classList.remove("result-card-visible");
    }

    showResult(data) {
        document.getElementById("result-text").textContent = `Место найдено!`;
        this.resultCard.classList.add("result-card-visible");
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.toggleProgress(true);
        
        await this.onSearch(new FormData(this.form));

        this.toggleProgress(false);
        this.showResult();
    }
}