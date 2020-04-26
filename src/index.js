import './styles/styles.css'
import './styles/less.less'
import './styles/sass.sass'
// import $ from 'jquery';
import Post from '@models/Post'
import './babel'

const post = new Post('Webpack Post');
console.log(post);

// $('pre').addClass('code').html(post.toString());