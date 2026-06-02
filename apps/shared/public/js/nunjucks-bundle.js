import nunjucks from 'nunjucks';

// Import this file only specifically
import postCard from '/apps/main/src/views/partials/postCard.njk?raw';

nunjucks.configure({ autoescape: true });

window.nunjucks = nunjucks;
window.postCard = postCard;