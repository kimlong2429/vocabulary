import { ArrayDataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { WordListService } from '../services/word-list.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  title = 'vocabulary';
  wordList = ['Oxford 3000', 'Oxford 5000']

  totalDays!: number

  selectedList!: string
  fromDay: number | undefined
  toDay: number | undefined

  constructor(private wls: WordListService, private router: Router) { }

  ngOnInit(): void { }

  onSelectedListChange(event: MatSelectChange) {
    this.fromDay = undefined
    this.toDay = undefined

    let url

    switch (event.value) {
      case 'Oxford 3000': {
        url = 'assets/data/oxford-3000.json'
        break;
      }
      case 'Oxford 5000': {
        url = 'assets/data/oxford-5000.json'
        break;
      }
      default:
        return;
    }

    this.wls.loadWordList(url).subscribe({
      next: res => {
        this.totalDays = Math.ceil(res.length / environment.target)
      }
    })

  }

  onFromDayChange(event: any) {
    this.toDay = undefined
  }

  fromDays(): number[] {
    return Array.from(Array(this.totalDays).keys())
  }

  toDays(): number[] {
    return Array.from({length: this.totalDays - this.fromDay!!}, (v, k) => k + this.fromDay!!)
  }

  async learn() {
    let params: any = {
      'wordList': this.selectedList
    }

    if (this.fromDay != undefined) {
      params['fromDay'] = this.fromDay
    }
    if (this.toDay != undefined) {
      params['toDay'] = this.toDay
    }

    await this.router.navigate(['/learn', params])
  }

  async review() {

  }
}
