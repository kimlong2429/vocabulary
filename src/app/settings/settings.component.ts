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
  selectedFromDay: number | undefined
  selectedToDay: number | undefined

  constructor(private wls: WordListService, private router: Router) { }

  ngOnInit(): void { }

  onSelectedListChange(event: MatSelectChange) {
    this.selectedFromDay = undefined
    this.selectedToDay = undefined

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
    this.selectedToDay = undefined
  }

  fromDays(): number[] {
    return Array.from(Array(this.totalDays).keys())
  }

  toDays(): number[] {
    return Array.from({length: this.totalDays - this.selectedFromDay!!}, (v, k) => k + this.selectedFromDay!!)
  }

  isWordListAvailable(): boolean {
    return !!this.selectedList && !!this.wls.words
  }

  async onClickLearn() {
    this.buildSelectedWords()
    await this.router.navigate(['/learn'])
  }

  private buildSelectedWords() {
    // set default value
    let fromDay = 0
    let toDay = Math.ceil(this.wls.words.length / environment.target)

    if (this.selectedFromDay != undefined) {
      fromDay = this.selectedFromDay
    }
    if (this.selectedToDay != undefined) {
      toDay = this.selectedToDay
    }

    this.wls.buildSelectedWords(fromDay, toDay)
  }

  async onClickReview() {
    this.buildSelectedWords()
    await this.router.navigate(['/review'])
  }
}
