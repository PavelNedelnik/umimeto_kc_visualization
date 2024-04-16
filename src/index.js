d3.csv("data/kc_demo.csv").then(function(data){
    // Specify the chart’s dimensions.
    const width = 928;
    const height = 600;

    // Compute the graph and start the force simulation.
    const root = d3.stratify()
        .id((d) => d.id)
        .parentId((d) => d.parent)
    (data);
    const links = root.links();
    const nodes = root.descendants();

    const simulation = d3.forceSimulation(nodes)
        // attraction of connected nodes
        .force("link", d3.forceLink(links).id(d => d.id).distance(0).strength(1))
        // repulsion of all nodes
        .force("charge", d3.forceManyBody().strength(-50))
        // towards center
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    // Create the container SVG.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;")
        .call(d3.zoom().on("zoom", zoomed));

    // Append links.
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line");

    // Append nodes.
    const node = svg.append("g")
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
        .attr("fill", d => d.children ? null : "#000")
        .attr("stroke", d => d.children ? null : "#fff")
        .attr("r", 3.5)
        .call(drag(simulation));


    // Append node labels.
    const label = svg.append("g")
    .selectAll("text")
    .data(nodes.filter(d => !d.children))
    .join("text")
    .attr("dy", "0.31em")
    .attr("x", 7)
    .text(d => d.data.name)
    .call(drag(simulation));
    node.append("title")
        .text(d => d.data.name);

    simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
        
    label
        .attr("x", d => d.x + 7)
        .attr("y", d => d.y);
    });

    function zoomed(event) {
        svg.attr("transform", event.transform);
    }

    document.getElementById("tree-container").appendChild(svg.node());
})

drag = simulation => {
  
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