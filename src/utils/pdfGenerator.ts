import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF for autotable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
        lastAutoTable: { finalY: number };
    }
}

export const generatePortfolioPDF = (portfolio: any, t: (key: string, options?: any) => string) => {
    const doc = new jsPDF();


    // Colors
    const primaryColor = [59, 130, 246]; // #3b82f6
    const darkColor = [31, 41, 55]; // #1f2937

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(t('portfolio.portfolioTitle'), 105, 25, { align: 'center' });

    // Reset text color
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    let yPos = 50;

    // Student Information Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(t('portfolio.studentInformation'), 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const studentInfo = [
        [t('common.name'), portfolio.studentInfo.name],
        [t('portfolio.studentId'), portfolio.studentInfo.studentId],
        [t('portfolio.school'), portfolio.studentInfo.school],
        [t('portfolio.district'), portfolio.studentInfo.district],
        [t('portfolio.grade'), portfolio.studentInfo.grade]
    ];

    doc.autoTable({
        startY: yPos,
        head: false,
        body: studentInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { cellWidth: 120 } }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Academic Summary Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(t('portfolio.academicSummary'), 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const academicSummary = [
        [t('portfolio.totalQuizzes'), portfolio.academicSummary.totalQuizzes],
        [t('portfolio.modelPapers'), portfolio.academicSummary.modelPapersCompleted],
        [t('portfolio.adaptiveQuizzes'), portfolio.academicSummary.adaptiveQuizzesCompleted],
        [t('portfolio.averageScore'), `${portfolio.academicSummary.averageScore}%`],
        [t('portfolio.bestScore'), `${portfolio.academicSummary.bestScore}%`],
        [t('portfolio.timeSpent'), `${portfolio.academicSummary.totalTimeSpent} ${t('common.minutes')}`]
    ];

    doc.autoTable({
        startY: yPos,
        head: false,
        body: academicSummary,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 90 }, 1: { cellWidth: 90 } }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Badges Section
    if (portfolio.badges && portfolio.badges.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(t('portfolio.badgesEarned'), 14, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(portfolio.badges.join(', '), 14, yPos);
        yPos += 15;
    }

    // Topic Mastery Section
    if (portfolio.topicMastery && portfolio.topicMastery.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(t('portfolio.topicMastery'), 14, yPos);
        yPos += 10;

        const masteryData = portfolio.topicMastery.slice(0, 10).map((topic: any) => [
            topic.topic,
            `${Math.round(topic.mastery)}%`,
            `${topic.questionsAttempted} ${t('progress.questionsAttempted')}`
        ]);

        doc.autoTable({
            startY: yPos,
            head: [[t('portfolio.topic') || 'Topic', t('portfolio.mastery') || 'Mastery', t('progress.questionsAttempted') || 'Questions']],
            body: masteryData,
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10 },
            columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 40 }, 2: { cellWidth: 60 } }
        });

        yPos = doc.lastAutoTable.finalY + 10;
    }

    // Footer
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        (doc as any).setPage(i);
        doc.setFontSize(8);
        // doc.setTextColor(128, 128, 128); // RGB signature
        doc.setTextColor(128, 128, 128);
        doc.text(
            `${t('portfolio.generatedOn')}: ${new Date(portfolio.generatedAt).toLocaleDateString()}`,
            14,
            285,
            { align: 'left' }
        );
        doc.text(
            `Page ${i} of ${pageCount}`,
            196,
            285,
            { align: 'right' }
        );
    }

    // Save PDF
    doc.save(`Portfolio_${portfolio.studentInfo.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`);
};
