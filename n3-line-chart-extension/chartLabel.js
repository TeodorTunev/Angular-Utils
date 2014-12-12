'use strict';

/* globals $, d3 */
/**
 * @ngdoc directive
 * @name angularResearchApp.directive:chartLabel
 * @description
 * # chartLabel
 */
angular.module('angularResearchApp').directive('chartLabel', function($timeout, $parse, $window) {
    var ARROW_WIDTH = 8;
    var MARGIN_X = 0;
    var DEFAULT_PADDING_LEFT_RIGHT = 10;
    var DEFAULT_PADDING_TOP_BOTTOM = 5;

    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {

            var pointIndex = attrs.clIndex;
            var text = attrs.clText;
            var paddingLeftRight = isFinite(attrs.clPaddingLeftRight) ? parseInt(attrs.clPaddingLeftRight) : DEFAULT_PADDING_LEFT_RIGHT;
            var paddingTopBottom = isFinite(attrs.clPaddingTopBottom) ? parseInt(attrs.clPaddingTopBottom) : DEFAULT_PADDING_TOP_BOTTOM;
            var elementId = attrs.id;
            var arrowWidth = isFinite(attrs.clArrowWidth) ? parseInt(attrs.clArrowWidth) : ARROW_WIDTH;
            var marginX = isFinite(attrs.clMarginX) ? parseInt(attrs.clMarginX) : MARGIN_X;

            function getTextSize(text) {
                var $text = $('<text class="chart-label-text" style="visibility:hidden">' + text + '</text>');
                $('body').append($text);
                var textWidth = $text.width();
                var textHeight = $text.height();
                var textLineHeight = parseInt($text.css('line-height'));
                $text.remove();

                return { width: textWidth, height: textHeight, lineHeight: textLineHeight };
            }

            function getPointCoordinates(pointDomElement) {
                var elementX = parseInt($(pointDomElement).attr('cx')) || 0;
                var elementY = parseInt($(pointDomElement).attr('cy')) || 0;

                return { x: elementX, y: elementY };
            }

            function getTextCoordinates(pointCoordinates, textSize, isOnRightSide) {
                var y = pointCoordinates.y - Math.round((textSize.height / 2)) + (textSize.height - Math.round(((textSize.lineHeight - textSize.height) / 2)));
                var x = isOnRightSide ?
                    pointCoordinates.x + arrowWidth + paddingLeftRight + marginX :
                    pointCoordinates.x - arrowWidth - textSize.width - paddingLeftRight - marginX;

                return { x: x, y: y };
            }

            function isLabelOutside(textSize, pointCoordinates) {
                var labelLeftSide = textSize.width + arrowWidth + (paddingLeftRight * 2) + marginX;
                var isOutside = (pointCoordinates.x - labelLeftSide) < 0;

                return isOutside;
            }

            function getRect(textSize, pointCoordinates, isOnRightSide) {
                var width = textSize.width + (paddingLeftRight * 2);
                var height = textSize.height + (paddingTopBottom * 2);

                var x = isOnRightSide ?
                    pointCoordinates.x + arrowWidth + marginX :
                    pointCoordinates.x - (textSize.width + 2 * paddingLeftRight + arrowWidth) - marginX;

                var y = pointCoordinates.y - textSize.height / 2 - paddingTopBottom;

                return { width: width, height: height, x: x, y: y };
            }

            function getPointDomElement() {
                var pointSelector = '#' + elementId + ' .dotGroup circle';
                var pointDomElement = $(pointSelector)[pointIndex];

                return pointDomElement;
            }

            function getArrowPoints(pointCoordinates, rect, isOnRightSide) {
                var arrowVerticalSideX = isOnRightSide ? rect.x : rect.x + rect.width;

                var upperPoint = {
                    x: arrowVerticalSideX,
                    y: pointCoordinates.y + rect.height / 2
                };

                var middlePoint = {
                    x: isOnRightSide ? pointCoordinates.x + marginX : pointCoordinates.x - marginX,
                    y: pointCoordinates.y
                };

                var lowerPoint = {
                    x: arrowVerticalSideX,
                    y: pointCoordinates.y - rect.height / 2
                };

                return [upperPoint, middlePoint, lowerPoint];
            }

            function getSvg() {
                var cssSelector = '#' + elementId + ' svg g';
                var svg = d3.select(cssSelector);
                return svg;
            }

            function renderRect(svg, rect) {
                svg.append('rect')
                    .attr('width', rect.width)
                    .attr('height', rect.height)
                    .attr('x', rect.x)
                    .attr('y', rect.y)
                    .attr('class', 'chart-label-rect');
            }

            function renderText(svg, textCoordinate) {
                svg.append('text')
                    .attr('x', textCoordinate.x)
                    .attr('y', textCoordinate.y)
                    .attr('class', 'chart-label-text')
                    .text(text);
            }

            function renderTriangle(svg, points) {
                var pathString = 'M' + points[0].x + ' ' + points[0].y + ' L' + points[1].x + ' ' + points[1].y + ' L' + points[2].x + ' ' + points[2].y + ' Z';

                svg.append('path')
                    .attr('d', pathString)
                    .attr('class', 'chart-label-arrow');
            }

            function drawChartLabel() {
                $timeout(function() {
                    var pointDomElement = getPointDomElement();
                    if (!pointDomElement) {
                        return;
                    }

                    var textSize = getTextSize(text);
                    var pointCoordinates = getPointCoordinates(pointDomElement);
                    var isOnRightSide = isLabelOutside(textSize, pointCoordinates);
                    var textCoordinates = getTextCoordinates(pointCoordinates, textSize, isOnRightSide);
                    var rect = getRect(textSize, pointCoordinates, isOnRightSide);
                    var arrowPoints = getArrowPoints(pointCoordinates, rect, isOnRightSide);

                    var svg = getSvg();
                    renderRect(svg, rect);
                    renderTriangle(svg, arrowPoints);
                    renderText(svg, textCoordinates);

                }, 10);
            }

            $window.addEventListener('resize', function() {
                drawChartLabel();
            });

            scope.$watch($parse(attrs.data), function() {
                drawChartLabel();
            });
        }
    };
});
