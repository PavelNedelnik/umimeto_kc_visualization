import { kcTree } from './kcTree.js';

d3.csv("data/tmp.csv").then(function(data){
    kcTree(data);
})
