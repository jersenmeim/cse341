const path = require('path');
const express = require('express');

const router = express.Router();

const books = [];

router.get('/add-book', (req, res, next) => {
    //res.sendFile(path.join(__dirname, '../', 'views/add-book.html'));
    res.render('add-book', {
        title: 'Library app',
    });
});


router.post('/add-book', (req, res, next) => {
    const book = req.body.title;
    const summary = req.body.summary;
    books.push({
        title: book,
        summary: summary
    });

    res.redirect('/');

});

router.use('/', (req, res, next) => {

    res.render('add-book', {
        title: 'Library app',
        book: books,
        path: '/'
    })
});

exports.routes = router;
exports.books = books;