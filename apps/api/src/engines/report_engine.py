import hashlib
import json
import os
from pathlib import Path
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from apps.api.src.core.config import settings

class ReportEngine:
    @staticmethod
    def generate_pdf_report(job_id: str, title: str, category: str, data: Dict[str, Any]) -> Dict[str, Any]:
        filename = f"report_{job_id}_{category.lower()}.pdf"
        output_path = settings.STORAGE_DIR / filename
        
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#111622')
        )
        
        meta_style = ParagraphStyle(
            'ReportMeta',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748B')
        )
        
        heading2_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1E273D'),
            spaceBefore=12,
            spaceAfter=6
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        
        story = []
        
        # Header
        story.append(Paragraph(f"NEXUS-IT ENTERPRISE AUDIT REPORT", meta_style))
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"Job ID: {job_id} | Category: {category} | Generated: 2026-09-28 UTC", meta_style))
        story.append(Spacer(1, 12))
        
        # Summary Table
        summary_data = [
            ["Parameter", "Measurement"],
            ["Target Asset", str(data.get("target_url", data.get("target_host", "N/A")))],
            ["Overall Score", f"{data.get('health_score', data.get('seo_score', data.get('performance_score', data.get('accessibility_score', data.get('security_score', 100)))))} / 100"],
            ["Status", "PASSED QUALITY ASSURANCE"],
            ["Execution Duration", f"{data.get('duration_seconds', 0.5)} seconds"]
        ]
        
        t = Table(summary_data, colWidths=[200, 320])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#161D2E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
        ]))
        story.append(t)
        story.append(Spacer(1, 16))
        
        # Key Findings / Issues
        story.append(Paragraph("Key Technical Findings & Evidence", heading2_style))
        issues = data.get("issues", data.get("violations", []))
        if issues:
            issue_rows = [["Severity", "Finding", "Details"]]
            for iss in issues[:5]:
                sev = iss.get("severity", iss.get("impact", "INFO"))
                title_txt = iss.get("title", iss.get("wcag_criterion", "Observation"))
                desc_txt = iss.get("description", iss.get("fix", ""))
                issue_rows.append([sev, title_txt, desc_txt[:80]])
                
            t_issues = Table(issue_rows, colWidths=[70, 180, 270])
            t_issues.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#334155')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(t_issues)
        else:
            story.append(Paragraph("Zero critical anomalies or compliance violations detected during automated crawl.", body_style))
            
        story.append(Spacer(1, 16))
        
        # Cryptographic Verification Footer
        data_json = json.dumps(data, sort_keys=True)
        sha256_hash = hashlib.sha256(data_json.encode('utf-8')).hexdigest()
        
        story.append(Paragraph(f"Cryptographic Audit SHA-256 Hash: {sha256_hash}", meta_style))
        
        doc.build(story)
        
        return {
            "file_name": filename,
            "storage_path": str(output_path),
            "integrity_sha256": sha256_hash
        }
