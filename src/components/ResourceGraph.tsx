import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { AWSResource, GraphData } from '../types';
import { Paper, Text, Tooltip } from '@mantine/core';

interface ResourceGraphProps {
  data: GraphData;
}

export function ResourceGraph({ data }: ResourceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: Math.max(600, width * 0.6)
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length || !dimensions.width) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const { width, height } = dimensions;
    const nodeRadius = Math.min(35, width / 25);

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const g = svg.append('g');

    const tooltip = d3.select('body').append('div')
      .attr('class', 'graph-tooltip')
      .style('opacity', 0);

    const forceStrength = -Math.min(width, height) / 4;

    const simulation = d3.forceSimulation(data.nodes)
      .force('charge', d3.forceManyBody().strength(forceStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius * 2));

    const nodes = g.selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    nodes.each(function(d: any) {
      const node = d3.select(this);
      
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
        case 'Lambda':
          color1 = '#FF6B6B';
          color2 = '#FF8787';
          break;
        case 'SNS':
          color1 = '#9B59B6';
          color2 = '#B39DDB';
          break;
        case 'SQS':
          color1 = '#E67E22';
          color2 = '#F39C12';
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
          
          const tooltipWidth = 200;
          const tooltipHeight = 80;
          const leftPos = Math.min(x + 10, window.innerWidth - tooltipWidth - 10);
          const topPos = Math.min(y - 28, window.innerHeight - tooltipHeight - 10);
          
          let tooltipContent = `
            <strong>${d.type}</strong><br/>
            Name: ${d.name}<br/>
            ID: ${d.id}
          `;

          if (d.type === 'Lambda' && d.details) {
            tooltipContent += `<br/>
              Runtime: ${d.details.runtime}<br/>
              Memory: ${d.details.memory}MB<br/>
              Timeout: ${d.details.timeout}s
            `;
          }
          
          tooltip.html(tooltipContent)
            .style('left', `${leftPos}px`)
            .style('top', `${topPos}px`);
        })
        .on('mouseout', function() {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
    });

    nodes.append('text')
      .text((d: any) => d.type)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .style('fill', 'white')
      .style('font-size', `${nodeRadius/3}px`)
      .style('font-weight', 'bold')
      .style('pointer-events', 'none');

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
        <>
          <Text size="sm" c="dimmed" mb="md">
            Found {data.nodes.length} resources ({
              Object.entries(
                data.nodes.reduce((acc: any, node) => {
                  acc[node.type] = (acc[node.type] || 0) + 1;
                  return acc;
                }, {})
              ).map(([type, count]) => `${type}: ${count}`).join(', ')
            })
          </Text>
          <svg 
            ref={svgRef} 
            style={{ 
              width: '100%', 
              height: dimensions.height,
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }} 
          />
        </>
      )}
    </Paper>
  );
}