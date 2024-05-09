d3.csv('data/tmp.csv').then(function(data){
    const width = 920;
    const height = 600;
    
    const root = d3.stratify()
        .id((d) => d.id)
        .parentId((d) => d.parent)
    (data);

    let links, nodes; // calculated in update


    // Create the container SVG.
    const svg = d3.select('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;")
        .call(d3.zoom().on("zoom", event => svg.attr("transform", event.transform)));

    const simulation = d3.forceSimulation()
    // attraction of connected nodes
    .force("link", d3.forceLink().id(d => d.id).distance(0).strength(d => d.target.data.level / 5))
    // repulsion of all nodes
    .force("charge", d3.forceManyBody().strength(-30))
    // push towards center
    .force("x", d3.forceX().strength(0.2))
    .force("y", d3.forceY().strength(0.2))


    const gLink = svg.append("g")

    const gNode = svg.append("g")


    function update(){
        links = root.links();
        nodes = root.descendants();
    
        simulation.nodes(nodes);
        simulation.force("link").links(links);


        // Append links.
        const link = gLink.selectAll("g")
            .data(links)
            .join("line")
                .attr("class", "link");

        // Append nodes.
        const node = gNode.selectAll("circle")
            .data(nodes, d => d.id)
            .join(
                enter => enter.append("circle")
                        .attr("fill", 'black')
                        .attr("stroke", 'black')
                        .attr("r", 3.5)
                    .call(drag(simulation))
                    .on("contextmenu", toggleNode),
                update => update
                    .attr("fill", 'red'),
                exit => exit
                    .attr("fill", 'blue')
                    .attr('stroke-opacity', 0)
                    .remove()
            )

        console.log(node);

        function toggleNode(event, d) {
            event.preventDefault();

            var clicked = root.find(node => node.id == d.id);

            clicked._children = clicked.children;
            clicked.children = null;

            update();
        }

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        simulation.alpha(1).restart();
    }

    update();

})


/*
Run simulation while user is dragging the nodes.
*/
function drag(simulation) {
  
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function flatten(root) {
    const nodes = []
    function recurse(node) {
      if (node.children) node.children.forEach(recurse)
      if (!node.id) node.id = ++i;
      else ++i;
      nodes.push(node)
    }
    recurse(root)
    return nodes
  }