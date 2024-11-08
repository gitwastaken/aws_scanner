import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AWSResource, GraphData } from '../types';

interface ResourceGraphProps {
  data: GraphData;
}

export function ResourceGraph({ data }: ResourceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation(data.nodes)
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create node groups
    const nodes = svg.selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles for nodes
    nodes.append('circle')
      .attr('r', 30)
      .style('fill', (d: any) => {
        switch (d.type) {
          case 'EC2': return '#FF9900';
          case 'S3': return '#569A31';
          case 'RDS': return '#3B48CC';
          default: return '#232F3E';
        }
      });

    // Add labels
    nodes.append('text')
      .text((d: any) => d.type)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .style('fill', 'white')
      .style('font-size', '12px');

    // Add service names below
    nodes.append('text')
      .text((d: any) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '3em')
      .style('fill', 'black')
      .style('font-size', '10px');

    simulation.on('tick', () => {
      nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, [data]);

  return (
    <svg ref={svgRef} style={{ border: '1px solid #ccc', borderRadius: '4px' }} />
  );
}