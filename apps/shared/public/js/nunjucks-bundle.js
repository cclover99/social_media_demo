import nunjucks from 'nunjucks';

// Import this file only specifically
import postCard from '/apps/main/src/views/partials/postCard.njk?raw';

const env = nunjucks.configure({ autoescape: true });
env.addFilter('json', (str) => JSON.parse(str));
env.addFilter('date', (str) => new Date(str).toLocaleString())

window.nunjucks = nunjucks;
window.postCard = postCard;