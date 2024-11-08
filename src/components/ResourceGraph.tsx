import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { AWSResource, GraphData } from '../types';
import { Paper, Text } from '@mantine/core';

interface ResourceGraphProps {
  data: GraphData;
}

export function ResourceGraph({ data }: ResourceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: Math.max(600, width * 0.6) // Responsive height
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length || !dimensions.width) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const { width, height } = dimensions;
    const nodeRadius = Math.min(35, width / 25); // Responsive node size

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Create a group for the graph
    const g = svg.append('g');

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'graph-tooltip')
      .style('opacity', 0);

    // Calculate appropriate force strength based on canvas size
    const forceStrength = -Math.min(width, height) / 4;

    const simulation = d3.forceSimulation(data.nodes)
      .force('charge', d3.forceManyBody().strength(forceStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius * 2));

    // Create node groups
    const nodes = g.selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles for nodes with gradient fills
    nodes.each(function(d: any) {
      const node = d3.select(this);
      
      // Define gradient
      const gradient = svg.append('defs')
        .append('radialGradient')
        .attr('id', `gradient-${d.id}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');

      let color1, color2;
      switch (d.type) {
        case 'EC2':
          color1 = '#FF9900';
          color2 = '#FFC300';
          break;
        case 'S3':
          color1 = '#569A31';
          color2 = '#76C442';
          break;
        case 'RDS':
          color1 = '#3B48CC';
          color2 = '#4B5EE4';
          break;
        default:
          color1 = '#232F3E';
          color2 = '#364150';
      }

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color2);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color1);

      // Add circle with gradient
      node.append('circle')
        .attr('r', nodeRadius)
        .style('fill', `url(#gradient-${d.id})`)
        .style('stroke', '#fff')
        .style('stroke-width', '2px')
        .on('mouseover', function(event, d: any) {
          const [x, y] = d3.pointer(event, document.body);
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          
          // Calculate tooltip position to prevent off-screen rendering
          const tooltipWidth = 200; // Approximate width
          const tooltipHeight = 80; // Approximate height
          const leftPos = Math.min(x + 10, window.innerWidth - tooltipWidth - 10);
          const topPos = Math.min(y - 28, window.innerHeight - tooltipHeight - 10);
          
          tooltip.html(`
            <strong>${d.type}</strong><br/>
            Name: ${d.name}<br/>
            ID: ${d.id}
          `)
            .style('left', `${leftPos}px`)
            .style('top', `${topPos}px`);
        })
        .on('mouseout', function() {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
    });

    // Add service type labels
    nodes.append('text')
      .text((d: any) => d.type)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .style('fill', 'white')
      .style('font-size', `${nodeRadius/3}px`)
      .style('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Add service names below
    nodes.append('text')
      .text((d: any) => {
        const name = d.name;
        return name.length > 20 ? name.substring(0, 17) + '...' : name;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '3.5em')
      .style('fill', '#333')
      .style('font-size', `${nodeRadius/3.5}px`)
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      nodes.attr('transform', (d: any) => {
        d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x));
        d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y));
        return `translate(${d.x},${d.y})`;
      });
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

    return () => {
      tooltip.remove();
    };
  }, [data, dimensions]);

  return (
    <Paper shadow="sm" radius="md" p="md" ref={containerRef}>
      {data.nodes.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">No resources found. Start by scanning your AWS infrastructure.</Text>
      ) : (
        <svg 
          ref={svgRef} 
          style={{ 
            width: '100%', 
            height: dimensions.height,
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
          }} 
        />
      )}
    </Paper>
  );
}