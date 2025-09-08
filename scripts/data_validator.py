#!/usr/bin/env python3
"""
Data Validation Module for Soccer Data Scraper

This module provides comprehensive validation for scraped CSV files to ensure
data quality, completeness, and correct formatting for the betting system.

Author: Data Integration Agent
Task: DS-02: Data Validation System
"""

import pandas as pd
import numpy as np
import os
import json
import re
from datetime import datetime, date
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ValidationResult:
    """Container for validation results"""
    is_valid: bool
    total_records: int
    errors: List[Dict[str, Any]]
    warnings: List[Dict[str, Any]]
    quality_score: float  # 0-100 scale
    summary: str


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


class DataValidator:
    """Main data validation class for soccer fixture CSV files"""
    
    # Expected schema for fixtures CSV
    EXPECTED_SCHEMA = {
        'league': str,
        'season': (str, int),
        'date': (str, 'datetime.date'),  # Allow both string dates and date objects
        'home_team': str,
        'away_team': str,
        'match_report': (str, type(None)),  # Allow null match reports for future fixtures
        'home_score': (float, int, type(None)),
        'away_score': (float, int, type(None)),
        'day_of_week': str
    }
    
    # Valid league formats
    VALID_LEAGUES = {
        'ENG-Premier League',
        'ESP-La Liga', 
        'ITA-Serie A',
        'GER-Bundesliga',
        'FRA-Ligue 1',
        'Big 5 European Leagues Combined'
    }
    
    # Date format regex
    DATE_PATTERN = re.compile(r'^\d{4}-\d{2}-\d{2}$')
    
    # Match report URL pattern
    MATCH_REPORT_PATTERN = re.compile(r'^/en/matches/[a-f0-9]{8}/.*$')
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize validator with optional config file"""
        self.config = self._load_config(config_path)
        self.validation_results = []
    
    def _load_config(self, config_path: Optional[str]) -> Dict:
        """Load validation configuration from JSON file"""
        default_config = {
            'min_quality_score': 95.0,
            'max_missing_percentage': 5.0,
            'allow_future_matches': True,
            'strict_league_validation': True,
            'enable_duplicate_check': True
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
            except Exception as e:
                print(f"Warning: Could not load config from {config_path}: {e}")
        
        return default_config
    
    def validate_csv_file(self, file_path: str) -> ValidationResult:
        """Validate a single CSV file"""
        if not os.path.exists(file_path):
            raise ValidationError(f"File not found: {file_path}")
        
        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            raise ValidationError(f"Could not read CSV file {file_path}: {e}")
        
        return self.validate_dataframe(df, file_path)
    
    def validate_dataframe(self, df: pd.DataFrame, source_name: str = "DataFrame") -> ValidationResult:
        """Validate a pandas DataFrame"""
        errors = []
        warnings = []
        total_records = len(df)
        
        # Schema validation
        schema_errors = self._validate_schema(df)
        errors.extend(schema_errors)
        
        # Data type validation
        type_errors = self._validate_data_types(df)
        errors.extend(type_errors)
        
        # Date validation
        date_errors, date_warnings = self._validate_dates(df)
        errors.extend(date_errors)
        warnings.extend(date_warnings)
        
        # League validation
        league_errors = self._validate_leagues(df)
        errors.extend(league_errors)
        
        # Team name validation
        team_errors = self._validate_teams(df)
        errors.extend(team_errors)
        
        # Score validation
        score_errors, score_warnings = self._validate_scores(df)
        errors.extend(score_errors)
        warnings.extend(score_warnings)
        
        # Match report validation
        report_errors = self._validate_match_reports(df)
        errors.extend(report_errors)
        
        # Duplicate check
        if self.config['enable_duplicate_check']:
            duplicate_errors = self._validate_duplicates(df)
            errors.extend(duplicate_errors)
        
        # Completeness check
        completeness_errors, completeness_warnings = self._validate_completeness(df)
        errors.extend(completeness_errors)
        warnings.extend(completeness_warnings)
        
        # Calculate quality score
        quality_score = self._calculate_quality_score(df, errors, warnings)
        
        # Determine if validation passed
        is_valid = (len(errors) == 0 and 
                   quality_score >= self.config['min_quality_score'])
        
        # Create summary
        summary = self._create_summary(total_records, errors, warnings, quality_score, source_name)
        
        return ValidationResult(
            is_valid=is_valid,
            total_records=total_records,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score,
            summary=summary
        )
    
    def _validate_schema(self, df: pd.DataFrame) -> List[Dict]:
        """Validate DataFrame schema"""
        errors = []
        
        # Check required columns
        missing_columns = set(self.EXPECTED_SCHEMA.keys()) - set(df.columns)
        if missing_columns:
            errors.append({
                'type': 'schema_error',
                'severity': 'critical',
                'message': f"Missing required columns: {', '.join(missing_columns)}",
                'columns': list(missing_columns)
            })
        
        # Check unexpected columns
        unexpected_columns = set(df.columns) - set(self.EXPECTED_SCHEMA.keys())
        if unexpected_columns:
            errors.append({
                'type': 'schema_warning', 
                'severity': 'warning',
                'message': f"Unexpected columns found: {', '.join(unexpected_columns)}",
                'columns': list(unexpected_columns)
            })
        
        return errors
    
    def _validate_data_types(self, df: pd.DataFrame) -> List[Dict]:
        """Validate data types for each column"""
        errors = []
        
        for column, expected_types in self.EXPECTED_SCHEMA.items():
            if column not in df.columns:
                continue
                
            if not isinstance(expected_types, tuple):
                expected_types = (expected_types,)
            
            # Check for invalid data types
            invalid_rows = []
            for idx, value in df[column].items():
                if pd.isna(value):
                    # None/NaN is acceptable for nullable columns
                    if type(None) not in expected_types:
                        invalid_rows.append(idx)
                else:
                    # Special handling for date objects
                    if column == 'date' and hasattr(value, 'year'):
                        # It's a date-like object, which is acceptable
                        continue
                    elif not any(isinstance(value, t) for t in expected_types if t is not type(None) and t != 'datetime.date'):
                        invalid_rows.append(idx)
            
            if invalid_rows:
                errors.append({
                    'type': 'data_type_error',
                    'severity': 'high',
                    'column': column,
                    'message': f"Invalid data types in column '{column}'",
                    'rows': invalid_rows[:10],  # Limit to first 10 for brevity
                    'total_invalid': len(invalid_rows)
                })
        
        return errors
    
    def _validate_dates(self, df: pd.DataFrame) -> Tuple[List[Dict], List[Dict]]:
        """Validate date formats and values"""
        errors = []
        warnings = []
        
        if 'date' not in df.columns:
            return errors, warnings
        
        invalid_dates = []
        future_dates = []
        today = date.today()
        
        for idx, date_value in df['date'].items():
            if pd.isna(date_value):
                invalid_dates.append(idx)
                continue
            
            # Handle both string dates and date objects
            if hasattr(date_value, 'year'):  # It's a date object
                parsed_date = date_value
                if hasattr(parsed_date, 'date'):
                    parsed_date = parsed_date.date()
            else:
                # Check date format for string dates
                if not self.DATE_PATTERN.match(str(date_value)):
                    invalid_dates.append(idx)
                    continue
                
                try:
                    parsed_date = datetime.strptime(str(date_value), '%Y-%m-%d').date()
                except ValueError:
                    invalid_dates.append(idx)
                    continue
            
            # Check for future dates (warning only)
            if parsed_date > today and not self.config['allow_future_matches']:
                future_dates.append(idx)
        
        if invalid_dates:
            errors.append({
                'type': 'date_format_error',
                'severity': 'high',
                'column': 'date',
                'message': f"Invalid date formats found",
                'rows': invalid_dates[:10],
                'total_invalid': len(invalid_dates)
            })
        
        if future_dates and not self.config['allow_future_matches']:
            warnings.append({
                'type': 'future_date_warning',
                'severity': 'low',
                'column': 'date',
                'message': f"Future dates found (may be expected for fixtures)",
                'rows': future_dates[:10],
                'total_count': len(future_dates)
            })
        
        return errors, warnings
    
    def _validate_leagues(self, df: pd.DataFrame) -> List[Dict]:
        """Validate league names"""
        errors = []
        
        if 'league' not in df.columns or not self.config['strict_league_validation']:
            return errors
        
        invalid_leagues = []
        unique_leagues = df['league'].dropna().unique()
        
        for league in unique_leagues:
            if league not in self.VALID_LEAGUES:
                # Find rows with this invalid league
                rows_with_league = df[df['league'] == league].index.tolist()
                invalid_leagues.extend(rows_with_league)
        
        if invalid_leagues:
            errors.append({
                'type': 'league_validation_error',
                'severity': 'medium',
                'column': 'league',
                'message': f"Invalid league names found",
                'rows': invalid_leagues[:10],
                'total_invalid': len(invalid_leagues),
                'valid_leagues': list(self.VALID_LEAGUES)
            })
        
        return errors
    
    def _validate_teams(self, df: pd.DataFrame) -> List[Dict]:
        """Validate team names"""
        errors = []
        
        for team_col in ['home_team', 'away_team']:
            if team_col not in df.columns:
                continue
            
            # Check for empty team names
            empty_teams = df[df[team_col].isna() | (df[team_col].str.strip() == '')].index.tolist()
            
            if empty_teams:
                errors.append({
                    'type': 'empty_team_error',
                    'severity': 'high',
                    'column': team_col,
                    'message': f"Empty team names found in {team_col}",
                    'rows': empty_teams[:10],
                    'total_empty': len(empty_teams)
                })
            
            # Check for team playing against itself
            if 'home_team' in df.columns and 'away_team' in df.columns:
                same_team_matches = df[df['home_team'] == df['away_team']].index.tolist()
                
                if same_team_matches:
                    errors.append({
                        'type': 'same_team_error',
                        'severity': 'high',
                        'message': "Teams playing against themselves found",
                        'rows': same_team_matches[:10],
                        'total_count': len(same_team_matches)
                    })
        
        return errors
    
    def _validate_scores(self, df: pd.DataFrame) -> Tuple[List[Dict], List[Dict]]:
        """Validate match scores"""
        errors = []
        warnings = []
        
        for score_col in ['home_score', 'away_score']:
            if score_col not in df.columns:
                continue
            
            # Check for negative scores
            negative_scores = df[(df[score_col] < 0) & df[score_col].notna()].index.tolist()
            
            if negative_scores:
                errors.append({
                    'type': 'negative_score_error',
                    'severity': 'high',
                    'column': score_col,
                    'message': f"Negative scores found in {score_col}",
                    'rows': negative_scores[:10],
                    'total_count': len(negative_scores)
                })
            
            # Check for extremely high scores (likely errors)
            high_scores = df[(df[score_col] > 20) & df[score_col].notna()].index.tolist()
            
            if high_scores:
                warnings.append({
                    'type': 'high_score_warning',
                    'severity': 'low',
                    'column': score_col,
                    'message': f"Unusually high scores found in {score_col} (>20 goals)",
                    'rows': high_scores[:10],
                    'total_count': len(high_scores)
                })
        
        # Check for incomplete score pairs
        if 'home_score' in df.columns and 'away_score' in df.columns:
            incomplete_scores = df[
                (df['home_score'].notna() & df['away_score'].isna()) |
                (df['home_score'].isna() & df['away_score'].notna())
            ].index.tolist()
            
            if incomplete_scores:
                warnings.append({
                    'type': 'incomplete_score_warning',
                    'severity': 'medium',
                    'message': "Incomplete score pairs found (one score present, other missing)",
                    'rows': incomplete_scores[:10],
                    'total_count': len(incomplete_scores)
                })
        
        return errors, warnings
    
    def _validate_match_reports(self, df: pd.DataFrame) -> List[Dict]:
        """Validate match report URLs"""
        errors = []
        
        if 'match_report' not in df.columns:
            return errors
        
        invalid_reports = []
        
        for idx, report in df['match_report'].items():
            if pd.isna(report):
                invalid_reports.append(idx)
            elif not self.MATCH_REPORT_PATTERN.match(str(report)):
                invalid_reports.append(idx)
        
        if invalid_reports:
            errors.append({
                'type': 'match_report_error',
                'severity': 'medium',
                'column': 'match_report',
                'message': "Invalid match report URLs found",
                'rows': invalid_reports[:10],
                'total_invalid': len(invalid_reports),
                'expected_pattern': '/en/matches/[hash]/...'
            })
        
        return errors
    
    def _validate_duplicates(self, df: pd.DataFrame) -> List[Dict]:
        """Check for duplicate records"""
        errors = []
        
        # Check for exact duplicates
        duplicate_rows = df[df.duplicated()].index.tolist()
        
        if duplicate_rows:
            errors.append({
                'type': 'duplicate_record_error',
                'severity': 'medium',
                'message': "Duplicate records found",
                'rows': duplicate_rows,
                'total_duplicates': len(duplicate_rows)
            })
        
        # Check for duplicate matches (same teams, same date)
        if all(col in df.columns for col in ['date', 'home_team', 'away_team']):
            match_duplicates = df[df.duplicated(
                subset=['date', 'home_team', 'away_team']
            )].index.tolist()
            
            if match_duplicates:
                errors.append({
                    'type': 'duplicate_match_error',
                    'severity': 'high',
                    'message': "Duplicate matches found (same teams, same date)",
                    'rows': match_duplicates,
                    'total_duplicates': len(match_duplicates)
                })
        
        return errors
    
    def _validate_completeness(self, df: pd.DataFrame) -> Tuple[List[Dict], List[Dict]]:
        """Check data completeness"""
        errors = []
        warnings = []
        
        total_records = len(df)
        max_missing_records = int(total_records * self.config['max_missing_percentage'] / 100)
        
        for column in df.columns:
            missing_count = df[column].isna().sum()
            missing_percentage = (missing_count / total_records) * 100
            
            if missing_count > max_missing_records:
                # Critical columns should have lower tolerance
                critical_columns = ['league', 'date', 'home_team', 'away_team']
                severity = 'critical' if column in critical_columns else 'high'
                
                errors.append({
                    'type': 'completeness_error',
                    'severity': severity,
                    'column': column,
                    'message': f"Too many missing values in {column}",
                    'missing_count': missing_count,
                    'missing_percentage': round(missing_percentage, 2),
                    'threshold': self.config['max_missing_percentage']
                })
            elif missing_count > 0:
                warnings.append({
                    'type': 'completeness_warning',
                    'severity': 'low',
                    'column': column,
                    'message': f"Some missing values in {column}",
                    'missing_count': missing_count,
                    'missing_percentage': round(missing_percentage, 2)
                })
        
        return errors, warnings
    
    def _calculate_quality_score(self, df: pd.DataFrame, errors: List[Dict], warnings: List[Dict]) -> float:
        """Calculate data quality score (0-100)"""
        total_records = len(df)
        if total_records == 0:
            return 0.0
        
        # Score deductions based on error severity
        score = 100.0
        
        for error in errors:
            severity = error.get('severity', 'medium')
            if severity == 'critical':
                score -= 20
            elif severity == 'high':
                score -= 10
            elif severity == 'medium':
                score -= 5
            else:
                score -= 2
        
        for warning in warnings:
            severity = warning.get('severity', 'low')
            if severity == 'medium':
                score -= 2
            else:
                score -= 1
        
        # Ensure score doesn't go below 0
        return max(0.0, score)
    
    def _create_summary(self, total_records: int, errors: List[Dict], 
                       warnings: List[Dict], quality_score: float, 
                       source_name: str) -> str:
        """Create validation summary"""
        status = "✅ PASSED" if len(errors) == 0 else "❌ FAILED"
        
        summary = f"""
=== DATA VALIDATION SUMMARY ===
Source: {source_name}
Status: {status}
Total Records: {total_records:,}
Quality Score: {quality_score:.1f}/100

Errors: {len(errors)}
Warnings: {len(warnings)}
"""
        
        if errors:
            summary += "\n🚨 ERRORS FOUND:\n"
            for error in errors[:5]:  # Show first 5 errors
                summary += f"  - {error['message']}\n"
            if len(errors) > 5:
                summary += f"  ... and {len(errors) - 5} more errors\n"
        
        if warnings:
            summary += "\n⚠️  WARNINGS:\n"
            for warning in warnings[:3]:  # Show first 3 warnings
                summary += f"  - {warning['message']}\n"
            if len(warnings) > 3:
                summary += f"  ... and {len(warnings) - 3} more warnings\n"
        
        return summary
    
    def generate_report(self, result: ValidationResult, output_path: str, 
                       format_type: str = 'json') -> None:
        """Generate validation report in specified format"""
        if format_type.lower() == 'json':
            self._generate_json_report(result, output_path)
        elif format_type.lower() == 'html':
            self._generate_html_report(result, output_path)
        else:
            raise ValueError(f"Unsupported format: {format_type}")
    
    def _generate_json_report(self, result: ValidationResult, output_path: str) -> None:
        """Generate JSON validation report"""
        report_data = {
            'validation_timestamp': datetime.now().isoformat(),
            'is_valid': result.is_valid,
            'total_records': result.total_records,
            'quality_score': result.quality_score,
            'summary': result.summary,
            'errors': result.errors,
            'warnings': result.warnings,
            'config_used': self.config
        }
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(report_data, f, indent=2, default=str)
    
    def _generate_html_report(self, result: ValidationResult, output_path: str) -> None:
        """Generate HTML validation report"""
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Data Validation Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background: #f4f4f4; padding: 20px; border-radius: 5px; }}
        .passed {{ color: green; }}
        .failed {{ color: red; }}
        .error {{ background: #ffe6e6; padding: 10px; margin: 5px 0; border-left: 4px solid red; }}
        .warning {{ background: #fff3cd; padding: 10px; margin: 5px 0; border-left: 4px solid orange; }}
        .summary {{ white-space: pre-line; }}
        table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Data Validation Report</h1>
        <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        <p><strong>Status:</strong> <span class="{'passed' if result.is_valid else 'failed'}">
            {'✅ PASSED' if result.is_valid else '❌ FAILED'}
        </span></p>
        <p><strong>Quality Score:</strong> {result.quality_score:.1f}/100</p>
        <p><strong>Total Records:</strong> {result.total_records:,}</p>
    </div>
    
    <div class="summary">{result.summary}</div>
    """
        
        if result.errors:
            html_content += "\n<h2>🚨 Errors</h2>\n"
            for error in result.errors:
                html_content += f'<div class="error"><strong>{error["type"]}:</strong> {error["message"]}</div>\n'
        
        if result.warnings:
            html_content += "\n<h2>⚠️ Warnings</h2>\n"
            for warning in result.warnings:
                html_content += f'<div class="warning"><strong>{warning["type"]}:</strong> {warning["message"]}</div>\n'
        
        html_content += "\n</body>\n</html>"
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(html_content)


def validate_file(file_path: str, config_path: Optional[str] = None) -> ValidationResult:
    """Convenience function to validate a single file"""
    validator = DataValidator(config_path)
    return validator.validate_csv_file(file_path)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate soccer fixture CSV files')
    parser.add_argument('file', help='Path to CSV file to validate')
    parser.add_argument('--config', help='Path to validation config file')
    parser.add_argument('--report', help='Output path for validation report')
    parser.add_argument('--format', choices=['json', 'html'], default='json',
                       help='Report format (default: json)')
    
    args = parser.parse_args()
    
    try:
        result = validate_file(args.file, args.config)
        print(result.summary)
        
        if args.report:
            validator = DataValidator(args.config)
            validator.generate_report(result, args.report, args.format)
            print(f"\nReport saved to: {args.report}")
        
    except ValidationError as e:
        print(f"Validation error: {e}")
        exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        exit(1)
