/*
Generate the Kc Tree.
*/
export function kcTree(data) {
    const width = 920;
    const height = 600;
    
    const { nodes, links } = buildTree(data);

    const simulation = simulate(nodes, links);

    // Create the container SVG.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;")
        .call(d3.zoom().on("zoom", zoomed));

    // Append links.
    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
            .attr("class", "link");

    // Append nodes.
    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
            .attr("class", d => d.children ? "node internal" : "node leaf")
            .attr("r", 3.5)
            .on("contextmenu", toggleNode)
            .call(drag(simulation));

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

    document.getElementById("tree-container").appendChild(svg.node());
}


/*
Enable zooming.
*/
function zoomed(event) {
    svg.attr("transform", event.transform);
}


/*
Build the tree.
*/
function buildTree(data) {
    const root = d3.stratify()
        .id((d) => d.id)
        .parentId((d) => d.parent)
    (data);
    const links = root.links();
    const nodes = root.descendants();
    return { nodes, links };
}


/*
Force simulation.
*/
function simulate(nodes, links) {
    const simulation = d3.forceSimulation(nodes)
    // attraction of connected nodes
    .force("link", d3.forceLink(links).id(d => d.id).distance(0).strength(d => d.target.data.level / 5))
    // repulsion of all nodes
    .force("charge", d3.forceManyBody().strength(-30))
    // push towards center
    .force("x", d3.forceX().strength(0.2))
    .force("y", d3.forceY().strength(0.2))

    return simulation;
}

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


function toggleNode(event, d) {
    event.preventDefault();

    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    updateNode(d);
}

function updateNode(d) {
    console.log(d);
    const node = d3.select(this);
    node.attr("fill", d => d.children ? null : "#000")
        .attr("stroke", d => d.children ? null : "#fff");
}